import { Router, Request, Response } from 'express';
import { getPool } from '../db';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { stampDocumentWithSignature } from '../pdfSigner';

export const projectAppRouter = Router();

// Setup Multer Storage for Asset Files (Images & PDFs)
const assetStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'assets');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${cleanName}`);
  },
});

const uploadAsset = multer({
  storage: assetStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Endpoint upload berkas asset (Gambar, PDF, dsb.)
projectAppRouter.post('/upload-asset', uploadAsset.single('asset_file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diunggah.' });
    }
    const fileUrl = `/uploads/assets/${req.file.filename}`;
    const isImage = !!req.file.mimetype.startsWith('image/');
    const isPdf = req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf');

    return res.json({
      success: true,
      url: fileUrl,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      fileType: isImage ? 'image' : isPdf ? 'document' : 'other',
    });
  } catch (error: any) {
    console.error('Asset upload error:', error);
    return res.status(500).json({ error: error.message || 'Gagal mengunggah file asset.' });
  }
});

// ==========================================
// 0. DATABASE CONNECTION TEST & HEALTH CHECK
// ==========================================
projectAppRouter.get('/db-test', async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    const pool = getPool();
    const [rows]: any = await pool.query('SELECT 1 as connected, DATABASE() as db_name, VERSION() as version, NOW() as server_time');
    const [tables]: any = await pool.query('SHOW TABLES');
    const latencyMs = Date.now() - start;

    let tableNames: string[] = [];
    if (Array.isArray(tables)) {
      tableNames = tables.map((t: any) => Object.values(t)[0] as string);
    }

    res.json({
      success: true,
      message: 'Koneksi ke MySQL database berhasil!',
      latencyMs,
      database: rows[0]?.db_name || process.env.DB_NAME || 'Unknown',
      version: rows[0]?.version || 'Unknown',
      serverTime: rows[0]?.server_time || new Date().toISOString(),
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '3306',
      tablesCount: tableNames.length,
      tables: tableNames,
    });
  } catch (error: any) {
    const latencyMs = Date.now() - start;
    console.error('MySQL connection check error:', error);
    res.status(500).json({
      success: false,
      message: `Gagal terhubung ke MySQL: ${error.message}`,
      latencyMs,
      database: process.env.DB_NAME || 'Unknown',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '3306',
    });
  }
});

// ==========================================
// 1. STATS OVERVIEW
// ==========================================
projectAppRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const pool = getPool();

    const [projectsCount]: any = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM pm_projects
    `);

    const [tasksCount]: any = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) as review,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done
      FROM pm_tasks
    `);

    const [postsCount]: any = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status IN ('idea', 'drafting', 'review') THEN 1 ELSE 0 END) as in_pipeline
      FROM sm_content_posts
    `);

    const [accountsCount]: any = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(followers_count) as total_followers
      FROM sm_social_accounts
    `);

    const [upcomingPosts]: any = await pool.query(`
      SELECT p.*, b.name as brand_name, b.color as brand_color, a.handle as account_handle
      FROM sm_content_posts p
      LEFT JOIN sm_brands b ON p.brand_id = b.id
      LEFT JOIN sm_social_accounts a ON p.social_account_id = a.id
      WHERE p.scheduled_at >= NOW()
      ORDER BY p.scheduled_at ASC
      LIMIT 5
    `);

    const [urgentTasks]: any = await pool.query(`
      SELECT t.*, p.title as project_title, p.color as project_color
      FROM pm_tasks t
      LEFT JOIN pm_projects p ON t.project_id = p.id
      WHERE t.status != 'done'
      ORDER BY 
        CASE t.priority 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          ELSE 4 
        END,
        t.due_date ASC
      LIMIT 5
    `);

    res.json({
      projects: projectsCount[0] || { total: 0, in_progress: 0, completed: 0 },
      tasks: tasksCount[0] || { total: 0, todo: 0, in_progress: 0, review: 0, done: 0 },
      posts: postsCount[0] || { total: 0, scheduled: 0, approved: 0, published: 0, in_pipeline: 0 },
      accounts: accountsCount[0] || { total: 0, active: 0, total_followers: 0 },
      upcomingPosts,
      urgentTasks,
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. BRANDS
// ==========================================
projectAppRouter.get('/brands', async (_req: Request, res: Response) => {
  try {
    const pool = getPool();
    const [rows]: any = await pool.query(`
      SELECT b.*, 
        (SELECT COUNT(*) FROM sm_social_accounts a WHERE a.brand_id = b.id) as accounts_count,
        (SELECT COUNT(*) FROM pm_projects p WHERE p.brand_id = b.id) as projects_count
      FROM sm_brands b 
      ORDER BY b.created_at DESC
    `);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.post('/brands', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { name, logo_url, color, tone_of_voice, target_audience } = req.body;
    const id = `b-${Date.now().toString(36)}`;
    await pool.query(
      `INSERT INTO sm_brands (id, name, logo_url, color, tone_of_voice, target_audience) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, logo_url || null, color || '#6366f1', tone_of_voice || '', target_audience || '']
    );
    res.json({ success: true, id, message: 'Brand berhasil ditambahkan' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.put('/brands/:id', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { name, logo_url, color, tone_of_voice, target_audience } = req.body;
    await pool.query(
      `UPDATE sm_brands SET name = ?, logo_url = ?, color = ?, tone_of_voice = ?, target_audience = ? WHERE id = ?`,
      [name, logo_url, color, tone_of_voice, target_audience, id]
    );
    res.json({ success: true, message: 'Brand berhasil diupdate' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.delete('/brands/:id', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query(`DELETE FROM sm_brands WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Brand berhasil dihapus' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. SOCIAL ACCOUNTS
// ==========================================
projectAppRouter.get('/social-accounts', async (_req: Request, res: Response) => {
  try {
    const pool = getPool();
    const [rows]: any = await pool.query(`
      SELECT a.*, b.name as brand_name, b.color as brand_color, b.logo_url as brand_logo
      FROM sm_social_accounts a
      LEFT JOIN sm_brands b ON a.brand_id = b.id
      ORDER BY a.followers_count DESC
    `);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.post('/social-accounts', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { brand_id, platform, handle, profile_url, pic_name, followers_count, monthly_target_posts, status, notes } = req.body;
    const id = `acc-${Date.now().toString(36)}`;
    await pool.query(
      `INSERT INTO sm_social_accounts (id, brand_id, platform, handle, profile_url, pic_name, followers_count, monthly_target_posts, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, brand_id, platform, handle, profile_url || null, pic_name || '', followers_count || 0, monthly_target_posts || 20, status || 'active', notes || '']
    );
    res.json({ success: true, id, message: 'Akun media sosial berhasil ditambahkan' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.put('/social-accounts/:id', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { brand_id, platform, handle, profile_url, pic_name, followers_count, monthly_target_posts, status, notes } = req.body;
    await pool.query(
      `UPDATE sm_social_accounts 
       SET brand_id = ?, platform = ?, handle = ?, profile_url = ?, pic_name = ?, followers_count = ?, monthly_target_posts = ?, status = ?, notes = ?
       WHERE id = ?`,
      [brand_id, platform, handle, profile_url, pic_name, followers_count, monthly_target_posts, status, notes, id]
    );
    res.json({ success: true, message: 'Akun berhasil diperbarui' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.delete('/social-accounts/:id', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query(`DELETE FROM sm_social_accounts WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Akun berhasil dihapus' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. PROJECTS
// ==========================================
projectAppRouter.get('/projects', async (_req: Request, res: Response) => {
  try {
    const pool = getPool();
    const [rows]: any = await pool.query(`
      SELECT p.*, b.name as brand_name, b.color as brand_color,
        (SELECT COUNT(*) FROM pm_tasks t WHERE t.project_id = p.id) as total_tasks,
        (SELECT COUNT(*) FROM pm_tasks t WHERE t.project_id = p.id AND t.status = 'done') as completed_tasks
      FROM pm_projects p
      LEFT JOIN sm_brands b ON p.brand_id = b.id
      ORDER BY p.due_date ASC
    `);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.post('/projects', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { brand_id, title, description, status, priority, start_date, due_date, progress, color, project_type } = req.body;
    const id = `proj-${Date.now().toString(36)}`;
    await pool.query(
      `INSERT INTO pm_projects (id, brand_id, title, description, status, priority, start_date, due_date, progress, color, project_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, 
        brand_id || null, 
        title, 
        description || '', 
        status || 'in_progress', 
        priority || 'medium', 
        start_date || new Date().toISOString().slice(0, 10), 
        due_date || null, 
        progress || 0, 
        color || (project_type === 'Internal' ? '#6366f1' : '#0ea5e9'),
        project_type || 'Client'
      ]
    );
    res.json({ success: true, id, message: 'Proyek berhasil dibuat' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.put('/projects/:id', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { brand_id, title, description, status, priority, start_date, due_date, progress, color, project_type } = req.body;
    await pool.query(
      `UPDATE pm_projects 
       SET brand_id = ?, title = ?, description = ?, status = ?, priority = ?, start_date = ?, due_date = ?, progress = ?, color = ?, project_type = ?
       WHERE id = ?`,
      [
        brand_id || null, 
        title, 
        description || '', 
        status || 'in_progress', 
        priority || 'medium', 
        start_date || null, 
        due_date || null, 
        progress || 0, 
        color || (project_type === 'Internal' ? '#6366f1' : '#0ea5e9'),
        project_type || 'Client',
        id
      ]
    );
    res.json({ success: true, message: 'Proyek berhasil diupdate' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.delete('/projects/:id', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query(`DELETE FROM pm_tasks WHERE project_id = ?`, [id]);
    await pool.query(`DELETE FROM pm_projects WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Proyek beserta task terkait berhasil dihapus' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. TASKS (KANBAN)
// ==========================================
projectAppRouter.get('/tasks', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { project_id, status } = req.query;
    let query = `
      SELECT t.*, p.title as project_title, p.color as project_color, b.name as brand_name
      FROM pm_tasks t
      LEFT JOIN pm_projects p ON t.project_id = p.id
      LEFT JOIN sm_brands b ON p.brand_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (project_id) {
      query += ` AND t.project_id = ?`;
      params.push(project_id);
    }
    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY t.order_index ASC, t.created_at DESC`;

    const [rows]: any = await pool.query(query, params);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.post('/tasks', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { project_id, title, description, status, priority, assignee_name, due_date, tags, links, subtasks } = req.body;
    const id = `task-${Date.now().toString(36)}`;
    try {
      await pool.query(
        `INSERT INTO pm_tasks (id, project_id, title, description, status, priority, assignee_name, due_date, tags, links, subtasks, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, project_id || null, title, description || '', status || 'todo', priority || 'medium', assignee_name || '', due_date || null, tags || '', links || '', subtasks || '', 0]
      );
    } catch (colErr) {
      // Fallback if links/subtasks columns not yet migrated
      await pool.query(
        `INSERT INTO pm_tasks (id, project_id, title, description, status, priority, assignee_name, due_date, tags, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, project_id || null, title, description || '', status || 'todo', priority || 'medium', assignee_name || '', due_date || null, tags || '', 0]
      );
    }
    res.json({ success: true, id, message: 'Task berhasil dibuat' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.patch('/tasks/:id/status', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { status } = req.body;
    await pool.query(`UPDATE pm_tasks SET status = ? WHERE id = ?`, [status, id]);
    res.json({ success: true, message: 'Status task berhasil diubah' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.put('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { project_id, title, description, status, priority, assignee_name, due_date, tags, links, subtasks } = req.body;
    try {
      await pool.query(
        `UPDATE pm_tasks 
         SET project_id = ?, title = ?, description = ?, status = ?, priority = ?, assignee_name = ?, due_date = ?, tags = ?, links = ?, subtasks = ?
         WHERE id = ?`,
        [project_id, title, description, status, priority, assignee_name, due_date, tags, links || '', subtasks || '', id]
      );
    } catch (colErr) {
      await pool.query(
        `UPDATE pm_tasks 
         SET project_id = ?, title = ?, description = ?, status = ?, priority = ?, assignee_name = ?, due_date = ?, tags = ?
         WHERE id = ?`,
        [project_id, title, description, status, priority, assignee_name, due_date, tags, id]
      );
    }
    res.json({ success: true, message: 'Task berhasil diperbarui' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.delete('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query(`DELETE FROM pm_tasks WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Task berhasil dihapus' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 6. CONTENT PILLARS
// ==========================================
projectAppRouter.get('/content-pillars', async (_req: Request, res: Response) => {
  try {
    const pool = getPool();
    const [rows]: any = await pool.query(`SELECT * FROM sm_content_pillars ORDER BY name ASC`);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.post('/content-pillars', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { name, color, description } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Nama pillar wajib diisi.' });
    }
    const id = `pil-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await pool.query(
      `INSERT INTO sm_content_pillars (id, name, color, description) VALUES (?, ?, ?, ?)`,
      [id, name.trim(), color || '#3b82f6', description || '']
    );
    res.status(201).json({ success: true, id, message: 'Pillar berhasil ditambahkan' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.put('/content-pillars/:id', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { name, color, description } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Nama pillar wajib diisi.' });
    }
    
    // Check old pillar name to sync posts if name changed
    const [existing]: any = await pool.query(`SELECT name FROM sm_content_pillars WHERE id = ?`, [id]);
    const oldName = existing?.[0]?.name;

    await pool.query(
      `UPDATE sm_content_pillars SET name = ?, color = ?, description = ? WHERE id = ?`,
      [name.trim(), color || '#3b82f6', description || '', id]
    );

    if (oldName && oldName !== name.trim()) {
      await pool.query(
        `UPDATE sm_content_posts SET pillar_name = ?, color = ? WHERE pillar_id = ? OR pillar_name = ?`,
        [name.trim(), color || '#3b82f6', id, oldName]
      );
    }

    res.json({ success: true, message: 'Pillar berhasil diperbarui' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.delete('/content-pillars/:id', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query(`DELETE FROM sm_content_pillars WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Pillar berhasil dihapus' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 7. CONTENT POSTS (CALENDAR)
// ==========================================
projectAppRouter.get('/content-posts', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { brand_id, platform, status, month, year } = req.query;

    let query = `
      SELECT p.*, b.name as brand_name, b.color as brand_color, b.logo_url as brand_logo,
             a.handle as account_handle, a.platform as account_platform
      FROM sm_content_posts p
      LEFT JOIN sm_brands b ON p.brand_id = b.id
      LEFT JOIN sm_social_accounts a ON p.social_account_id = a.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (brand_id) {
      query += ` AND p.brand_id = ?`;
      params.push(brand_id);
    }
    if (platform) {
      query += ` AND p.platform = ?`;
      params.push(platform);
    }
    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }
    if (month && year) {
      query += ` AND MONTH(p.scheduled_at) = ? AND YEAR(p.scheduled_at) = ?`;
      params.push(month, year);
    }

    query += ` ORDER BY p.scheduled_at ASC`;

    const [rows]: any = await pool.query(query, params);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.post('/content-posts', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const {
      brand_id, social_account_id, project_id, title, pillar_name, platform,
      content_type, hook, caption, hashtags, call_to_action, media_urls,
      scheduled_at, status, assignee_copy, assignee_design, notes, assignees, published_link
    } = req.body;

    const finalAssigneeCopy = Array.isArray(assignees) && assignees.length > 0
      ? assignees.join(', ')
      : (assignee_copy || '');

    const id = `post-${Date.now().toString(36)}`;
    await pool.query(
      `INSERT INTO sm_content_posts 
       (id, brand_id, social_account_id, project_id, title, pillar_name, platform, content_type,
        hook, caption, hashtags, call_to_action, media_urls, scheduled_at, status, assignee_copy, assignee_design, notes, published_link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, brand_id || null, social_account_id || null, project_id || null, title,
        pillar_name || 'Edukasi & Tips', platform || 'instagram', content_type || 'feed_single',
        hook || '', caption || '', hashtags || '', call_to_action || '',
        JSON.stringify(media_urls || []), scheduled_at || null, status || 'drafting',
        finalAssigneeCopy, assignee_design || '', notes || '', published_link || ''
      ]
    );
    res.json({ success: true, id, message: 'Postingan konten berhasil disimpan' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.patch('/content-posts/:id/status', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { status } = req.body;
    await pool.query(`UPDATE sm_content_posts SET status = ? WHERE id = ?`, [status, id]);
    res.json({ success: true, message: 'Status konten berhasil diupdate' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.put('/content-posts/:id', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const {
      brand_id, social_account_id, project_id, title, pillar_name, platform,
      content_type, hook, caption, hashtags, call_to_action, media_urls,
      scheduled_at, status, assignee_copy, assignee_design, notes, published_link, assignees
    } = req.body;

    const finalAssigneeCopy = Array.isArray(assignees) && assignees.length > 0
      ? assignees.join(', ')
      : (assignee_copy || '');

    await pool.query(
      `UPDATE sm_content_posts 
       SET brand_id = ?, social_account_id = ?, project_id = ?, title = ?, pillar_name = ?, platform = ?,
           content_type = ?, hook = ?, caption = ?, hashtags = ?, call_to_action = ?, media_urls = ?,
           scheduled_at = ?, status = ?, assignee_copy = ?, assignee_design = ?, notes = ?, published_link = ?
       WHERE id = ?`,
      [
        brand_id, social_account_id, project_id, title, pillar_name, platform,
        content_type, hook, caption, hashtags, call_to_action, JSON.stringify(media_urls || []),
        scheduled_at || null, status, finalAssigneeCopy, assignee_design || '', notes, published_link, id
      ]
    );
    res.json({ success: true, message: 'Konten berhasil diperbarui' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 7B. CONTENT DRAFTS (BANK IDE & REFERENSI)
// ==========================================
projectAppRouter.get('/drafts', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { brand_id, status, search } = req.query;

    let query = `
      SELECT d.*, b.name as brand_name, b.color as brand_color, b.logo_url as brand_logo,
             p.title as project_title, p.color as project_color
      FROM sm_content_drafts d
      LEFT JOIN sm_brands b ON d.brand_id = b.id
      LEFT JOIN pm_projects p ON d.project_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (brand_id && brand_id !== 'all') {
      query += ` AND d.brand_id = ?`;
      params.push(brand_id);
    }
    if (status && status !== 'all') {
      query += ` AND d.status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND (d.title LIKE ? OR d.hook LIKE ? OR d.concept LIKE ? OR d.reference_urls LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY d.created_at DESC`;

    const [rows]: any = await pool.query(query, params);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.post('/drafts', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const {
      brand_id, project_id, title, hook, concept, reference_urls, reference_attachments,
      platform, content_type, pillar_id, pillar_name, status, notes, tags, assignee_name
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Judul ide konten wajib diisi.' });
    }

    const id = `draft-${Date.now().toString(36)}`;
    await pool.query(
      `INSERT INTO sm_content_drafts 
       (id, brand_id, project_id, title, hook, concept, reference_urls, reference_attachments,
        platform, content_type, pillar_id, pillar_name, status, notes, tags, assignee_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, brand_id || null, project_id || null, title.trim(), hook || '', concept || '',
        reference_urls || '', reference_attachments || '', platform || 'instagram',
        content_type || 'reels', pillar_id || null, pillar_name || 'Edukasi & Tips',
        status || 'idea', notes || '', tags || '', assignee_name || ''
      ]
    );

    res.json({ success: true, id, message: 'Draft ide konten berhasil ditambahkan' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.put('/drafts/:id', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const {
      brand_id, project_id, title, hook, concept, reference_urls, reference_attachments,
      platform, content_type, pillar_id, pillar_name, status, notes, tags, assignee_name
    } = req.body;

    await pool.query(
      `UPDATE sm_content_drafts 
       SET brand_id = ?, project_id = ?, title = ?, hook = ?, concept = ?,
           reference_urls = ?, reference_attachments = ?, platform = ?, content_type = ?,
           pillar_id = ?, pillar_name = ?, status = ?, notes = ?, tags = ?, assignee_name = ?
       WHERE id = ?`,
      [
        brand_id || null, project_id || null, title, hook || '', concept || '',
        reference_urls || '', reference_attachments || '', platform || 'instagram',
        content_type || 'reels', pillar_id || null, pillar_name || 'Edukasi & Tips',
        status || 'idea', notes || '', tags || '', assignee_name || '', id
      ]
    );

    res.json({ success: true, message: 'Draft ide konten berhasil diperbarui' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.delete('/drafts/:id', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query(`DELETE FROM sm_content_drafts WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Draft ide konten berhasil dihapus' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.post('/drafts/:id/schedule', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { scheduled_at, brand_id, platform, content_type } = req.body;

    if (!scheduled_at) {
      return res.status(400).json({ error: 'Tanggal dan jam jadwal (scheduled_at) wajib diisi.' });
    }

    const [draftRows]: any = await pool.query(`SELECT * FROM sm_content_drafts WHERE id = ?`, [id]);
    const draft = draftRows?.[0];
    if (!draft) {
      return res.status(404).json({ error: 'Draft ide konten tidak ditemukan.' });
    }

    const postId = `post-${Date.now().toString(36)}`;
    const finalBrandId = brand_id || draft.brand_id;
    const finalPlatform = platform || draft.platform || 'instagram';
    const finalContentType = content_type || draft.content_type || 'reels';

    // Insert into sm_content_posts
    await pool.query(
      `INSERT INTO sm_content_posts 
       (id, brand_id, project_id, title, pillar_name, platform, content_type,
        hook, caption, hashtags, scheduled_at, status, notes, media_urls)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        postId, finalBrandId || null, draft.project_id || null, draft.title,
        draft.pillar_name || 'Edukasi & Tips', finalPlatform, finalContentType,
        draft.hook || '', draft.concept || '', '', scheduled_at, 'scheduled',
        draft.notes || '', JSON.stringify(draft.reference_attachments ? [draft.reference_attachments] : [])
      ]
    );

    // Update draft status to scheduled
    await pool.query(
      `UPDATE sm_content_drafts 
       SET status = 'scheduled', scheduled_post_id = ?, scheduled_at = ?
       WHERE id = ?`,
      [postId, scheduled_at, id]
    );

    res.json({
      success: true,
      postId,
      message: 'Ide konten berhasil dijadwalkan ke Calender Content!'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 8. AI COPYWRITING ASSISTANT
// ==========================================
projectAppRouter.post('/ai-generate', async (req: Request, res: Response) => {
  try {
    const { topic, pillar, platform, brand_tone } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'ISI_DENGAN_API_KEY_GEMINI_ANDA' && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Kamu adalah copywriter profesional untuk agensi media sosial.
Buatkan konten media sosial untuk platform ${platform || 'Instagram'} dengan topik: "${topic}".
Pilar konten: ${pillar || 'Edukasi & Tips'}
Tone of voice brand: ${brand_tone || 'Ramah, modern, dan informatif'}

Berikan output JSON dalam format:
{
  "hook": "1 kalimat pembuka 3 detik pertama yang sangat memikat / clickworthy",
  "caption": "Teks caption lengkap dengan paragraf rapi dan persuasif",
  "hashtags": "5-8 hashtag relevan berurutan diawali tanda pagar",
  "call_to_action": "1 kalimat ajakan bertindak (CTA)"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json(parsed);
        }
      } catch (aiErr) {
        console.warn('Gemini API call error, falling back to smart template:', aiErr);
      }
    }

    // Smart Creative Agency Template Fallback
    const templates: Record<string, { hook: string; caption: string; hashtags: string; call_to_action: string }> = {
      'Edukasi & Tips': {
        hook: `Stop lakuin hal ini kalau kalian mau hasil maksimal di ${topic}! ❌`,
        caption: `Banyak orang yang masih keliru saat ngurusin ${topic}.\n\nBerikut 3 langkah simpel yang terbukti efektif:\n1. Pahami pola dasar dan tentukan target yang jelas\n2. Konsistensi kecil setiap hari > heboh sehari doang\n3. Evaluasi metrik setiap akhir pekan\n\nPraktekin trik ini sekarang juga dan rasakan bedanya! ✨`,
        hashtags: `#${(topic || 'Tips').replace(/\s+/g, '')} #EdukasiKreatif #DigitalMarketing #AgencyTips #TipsPraktis`,
        call_to_action: 'Save postingan ini biar gak lupa pas praktek nanti! 📌'
      },
      'Promo & Penjualan': {
        hook: `PROMO TERBATAS! Khusus 50 orang tercepat hari ini aja! ⚡🔥`,
        caption: `Kabar gembira buat kalian yang udah nungguin momen ini! Sekarang ${topic} lagi ada diskon spesial s/d 50% + bonus eksklusif.\n\nJangan tunggu sampai kehabisan kuota ya, promo ini cuma berlaku sampai stok habis! 🛒✨`,
        hashtags: `#PromoSpesial #DiskonGajian #FlashSale #BeliSekarang #BestDeal`,
        call_to_action: 'Klik link di bio atau komen "MAU" buat dapetin voucher khususnya sekarang! 🛍️'
      },
      'Entertainment & Tren': {
        hook: `Realita vs Ekspektasi pas lagi ngerjain ${topic}... 😂`,
        caption: `Kira-kira begini nih di balik layar kalau tim kreatif lagi fokus garap ${topic}.\nSiapa di sini yang tim 'sebentar lagi beres' tapi kenyataannya masih revisi ke-15? 🙋‍♂️🎬\n\nTag temen kalian yang relate banget sama kondisi ini!`,
        hashtags: `#RelateBanget #BehindTheScenes #AgencyLife #POV #FYP #Trending`,
        call_to_action: 'Tag temen kantor kalian yang kelakuannya persis begini di kolom komentar! 👇'
      }
    };

    const selected = templates[pillar] || templates['Edukasi & Tips'];
    res.json(selected);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.delete('/content-posts', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { scope, month, year, brand_id } = req.query;

    let query = `DELETE FROM sm_content_posts WHERE 1=1`;
    const params: any[] = [];

    if (scope === 'month' && month && year) {
      query += ` AND (
        (MONTH(scheduled_at) = ? AND YEAR(scheduled_at) = ?)
        OR scheduled_at LIKE ?
      )`;
      const paddedMonth = String(month).padStart(2, '0');
      params.push(month, year, `${year}-${paddedMonth}%`);
    } else if (scope === 'all') {
      // delete all posts
    } else {
      return res.status(400).json({ error: 'Scope wajib dispesifikasikan (all atau month).' });
    }

    if (brand_id && brand_id !== 'all') {
      query += ` AND brand_id = ?`;
      params.push(brand_id);
    }

    const [result]: any = await pool.query(query, params);
    res.json({ 
      success: true, 
      message: scope === 'month' ? `Data konten bulan ${month}/${year} berhasil dihapus` : 'Semua data konten berhasil dihapus',
      affectedRows: result?.affectedRows || 0 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.delete('/content-posts/:id', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query(`DELETE FROM sm_content_posts WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Konten berhasil dihapus' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 8. USER AUTH & ACCOUNT MANAGEMENT ROUTES
// ==========================================

projectAppRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi.' });
    }

    const [rows] = await pool.query<any[]>(
      `SELECT id, username, password_hash, full_name, position, role, avatar_url, is_active
       FROM app_users
       WHERE LOWER(username) = LOWER(?) LIMIT 1`,
      [String(username).trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    const user = rows[0];
    if (!user.is_active) {
      return res.status(403).json({ error: 'Akun Anda dinonaktifkan. Silakan hubungi Master Admin.' });
    }

    if (user.password_hash !== password) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    res.json({
      success: true,
      message: 'Login berhasil!',
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        position: user.position,
        role: user.role,
        avatar_url: user.avatar_url,
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.get('/accounts', async (_req: Request, res: Response) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query<any[]>(`
      SELECT id, username, password_hash as password, full_name, position, role, avatar_url, is_active, created_at, updated_at
      FROM app_users
      ORDER BY FIELD(role, 'Master Admin', 'Team'), created_at ASC
    `);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.post('/accounts', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { username, password, full_name, position, role, is_active } = req.body;
    if (!username || !password || !full_name || !position || !role) {
      return res.status(400).json({ error: 'Username, password, nama lengkap, posisi, dan role wajib diisi.' });
    }

    const [existing] = await pool.query<any[]>(
      'SELECT id FROM app_users WHERE LOWER(username) = LOWER(?)',
      [username.trim()]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username sudah digunakan. Silakan pilih username lain.' });
    }

    const id = `usr-${Date.now()}`;
    await pool.query(`
      INSERT INTO app_users (id, username, password_hash, full_name, position, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, username.trim(), password, full_name.trim(), position.trim(), role, is_active !== false]);

    res.status(201).json({ id, message: 'Akun berhasil dibuat' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.put('/accounts/:id', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { username, password, full_name, position, role, is_active } = req.body;

    if (!username || !full_name || !position || !role) {
      return res.status(400).json({ error: 'Username, nama lengkap, posisi, dan role wajib diisi.' });
    }

    const [existing] = await pool.query<any[]>(
      'SELECT id FROM app_users WHERE LOWER(username) = LOWER(?) AND id != ?',
      [username.trim(), id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username sudah digunakan oleh akun lain.' });
    }

    if (password && password.trim()) {
      await pool.query(`
        UPDATE app_users
        SET username = ?, password_hash = ?, full_name = ?, position = ?, role = ?, is_active = ?
        WHERE id = ?
      `, [username.trim(), password.trim(), full_name.trim(), position.trim(), role, is_active !== false, id]);
    } else {
      await pool.query(`
        UPDATE app_users
        SET username = ?, full_name = ?, position = ?, role = ?, is_active = ?
        WHERE id = ?
      `, [username.trim(), full_name.trim(), position.trim(), role, is_active !== false, id]);
    }

    res.json({ success: true, message: 'Akun berhasil diperbarui' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.delete('/accounts/:id', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query(`DELETE FROM app_users WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Akun berhasil dihapus' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================================================================
// Application Settings
// ==================================================================
projectAppRouter.get('/settings/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    if (key === 'adminCredentials') {
      return res.status(404).json({ error: 'Pengaturan tidak ditemukan.' });
    }
    const pool = getPool();
    const [rows]: any = await pool.query(`SELECT setting_value FROM global_settings WHERE setting_key = ?`, [key]);
    if (!rows || rows.length === 0) {
      return res.json(null);
    }
    let value = rows[0].setting_value;
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (e) {
        // Keep as string
      }
    }
    if (key === 'liva_global_configs' && value && typeof value === 'object') {
      delete value.adminCredentials;
    }
    return res.json(value);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

projectAppRouter.post('/settings/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    if (key === 'adminCredentials') {
      return res.status(403).json({ error: 'Kredensial admin dikelola oleh server.' });
    }
    const pool = getPool();
    const value = req.body && typeof req.body === 'object'
      ? (Array.isArray(req.body) ? [...req.body] : { ...req.body })
      : req.body;
    if (key === 'liva_global_configs' && value) delete value.adminCredentials;
    
    await pool.query(`
      INSERT INTO global_settings (setting_key, setting_value) 
      VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE setting_value = ?
    `, [key, JSON.stringify(value), JSON.stringify(value)]);
    res.json({ success: true, key });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 10. DIGITAL SIGNATURES & BERKAS (TTD BERKAS)
// ==========================================

// 10.1 List all signed documents
projectAppRouter.get('/documents', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const [rows]: any = await pool.query(`
      SELECT * FROM app_signed_documents 
      ORDER BY created_at DESC
    `);
    res.json(rows || []);
  } catch (error: any) {
    console.error('Error fetching signed documents:', error);
    res.status(500).json({ error: error.message });
  }
});

// 10.2 Create a new signed document request / direct sign
projectAppRouter.post('/documents', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const {
      title,
      file_url,
      file_name,
      file_source = 'asset',
      sign_type = 'internal',
      signer_name = '',
      signer_role = '',
      signer_email = '',
      signer_phone = '',
      signer_notes = '',
      signature_data_url = null,
      signature_position = null,
      created_by = 'User',
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Judul dokumen wajib diisi.' });
    }

    const docId = `doc-${Date.now()}`;
    const signingToken = `st-${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
    const isDirectSigned = sign_type === 'internal' && !!signature_data_url;
    const initialStatus = isDirectSigned ? 'signed' : 'pending';
    const signedAt = isDirectSigned ? new Date() : null;

    let signedFileUrl: string | null = null;
    if (isDirectSigned && signature_data_url) {
      try {
        const parsedPos = typeof signature_position === 'string' ? JSON.parse(signature_position) : signature_position;
        signedFileUrl = await stampDocumentWithSignature({
          documentId: docId,
          originalFileUrl: file_url,
          documentTitle: title.trim(),
          signatureDataUrl: signature_data_url,
          position: {
            ...parsedPos,
            signerName: signer_name || 'Penandatangan Internal',
            signerRole: signer_role || '',
            signedAt: new Date().toLocaleString('id-ID'),
          },
        });
      } catch (err) {
        console.error('Error stamping direct signed document:', err);
      }
    }

    const posString = signature_position 
      ? (typeof signature_position === 'string' ? signature_position : JSON.stringify(signature_position))
      : null;

    await pool.query(`
      INSERT INTO app_signed_documents (
        id, title, file_url, file_name, file_source, sign_type, status,
        signing_token, signer_name, signer_role, signer_email, signer_phone,
        signer_notes, signature_data_url, signed_file_url, signature_position, signed_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      docId,
      title.trim(),
      file_url || '',
      file_name || '',
      file_source,
      sign_type,
      initialStatus,
      signingToken,
      signer_name || '',
      signer_role || '',
      signer_email || '',
      signer_phone || '',
      signer_notes || '',
      signature_data_url || null,
      signedFileUrl,
      posString,
      signedAt,
      created_by,
    ]);

    res.json({
      success: true,
      id: docId,
      signing_token: signingToken,
      status: initialStatus,
      signed_file_url: signedFileUrl,
      message: isDirectSigned 
        ? 'Dokumen berhasil ditandatangani dan dibubuhkan langsung ke file PDF!' 
        : 'Permintaan tanda tangan berkas berhasil dibuat.',
    });
  } catch (error: any) {
    console.error('Error creating document signature:', error);
    res.status(500).json({ error: error.message });
  }
});

// 10.3 Public View Document (NO LOGIN REQUIRED)
projectAppRouter.get('/documents/public/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const pool = getPool();
    const [rows]: any = await pool.query(`
      SELECT 
        id, title, file_url, file_name, file_source, sign_type, status,
        signing_token, signer_name, signer_role, signer_email, signer_notes,
        signature_data_url, signed_file_url, signature_position, signed_at, created_at, created_by
      FROM app_signed_documents 
      WHERE signing_token = ?
    `, [token]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Tautan tanda tangan tidak ditemukan atau sudah kedaluwarsa.' });
    }

    res.json({
      success: true,
      document: rows[0],
    });
  } catch (error: any) {
    console.error('Error fetching public document for signing:', error);
    res.status(500).json({ error: error.message });
  }
});

// 10.4 Public Submit Signature (NO LOGIN REQUIRED)
projectAppRouter.post('/documents/public/:token/sign', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { signature_data_url, signer_name, signer_role, signature_position } = req.body;

    if (!signature_data_url) {
      return res.status(400).json({ error: 'Goresan tanda tangan digital wajib dibubuhkan.' });
    }

    const pool = getPool();
    const [existing]: any = await pool.query(`
      SELECT id, title, file_url, status, signer_name, signer_role, signature_position FROM app_signed_documents WHERE signing_token = ?
    `, [token]);

    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Dokumen tidak ditemukan.' });
    }

    const doc = existing[0];
    const finalSignerName = signer_name?.trim() || doc.signer_name || 'Pihak Eksternal';
    const finalSignerRole = signer_role?.trim() || doc.signer_role || 'Penerima Berkas';

    const parsedPos = signature_position 
      ? (typeof signature_position === 'string' ? JSON.parse(signature_position) : signature_position)
      : (doc.signature_position ? (typeof doc.signature_position === 'string' ? JSON.parse(doc.signature_position) : doc.signature_position) : null);

    let signedFileUrl: string | null = null;
    try {
      signedFileUrl = await stampDocumentWithSignature({
        documentId: doc.id,
        originalFileUrl: doc.file_url,
        documentTitle: doc.title,
        signatureDataUrl: signature_data_url,
        position: {
          ...parsedPos,
          signerName: finalSignerName,
          signerRole: finalSignerRole,
          signedAt: new Date().toLocaleString('id-ID'),
        },
      });
    } catch (e) {
      console.warn('Error stamping public signed document:', e);
    }

    const posString = parsedPos ? JSON.stringify(parsedPos) : null;

    await pool.query(`
      UPDATE app_signed_documents 
      SET 
        status = 'signed',
        signature_data_url = ?,
        signed_file_url = COALESCE(?, signed_file_url),
        signature_position = COALESCE(?, signature_position),
        signer_name = ?,
        signer_role = ?,
        signed_at = NOW()
      WHERE signing_token = ?
    `, [signature_data_url, signedFileUrl, posString, finalSignerName, finalSignerRole, token]);

    res.json({
      success: true,
      message: 'Tanda tangan berhasil dibubuhkan langsung ke berkas dokumen!',
      signed_file_url: signedFileUrl,
      signer_name: finalSignerName,
      signed_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error signing public document:', error);
    res.status(500).json({ error: error.message });
  }
});

// 10.5 Internal Direct Sign Document
projectAppRouter.post('/documents/:id/internal-sign', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { signature_data_url, signer_name, signer_role, signature_position } = req.body;

    if (!signature_data_url) {
      return res.status(400).json({ error: 'Goresan tanda tangan digital wajib dibubuhkan.' });
    }

    const pool = getPool();
    const [existing]: any = await pool.query(`
      SELECT id, title, file_url, signer_name, signer_role, signature_position FROM app_signed_documents WHERE id = ?
    `, [id]);

    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Dokumen tidak ditemukan.' });
    }

    const doc = existing[0];
    const finalSignerName = signer_name || doc.signer_name || 'Penandatangan Internal';
    const finalSignerRole = signer_role || doc.signer_role || '';

    const parsedPos = signature_position 
      ? (typeof signature_position === 'string' ? JSON.parse(signature_position) : signature_position)
      : (doc.signature_position ? (typeof doc.signature_position === 'string' ? JSON.parse(doc.signature_position) : doc.signature_position) : null);

    let signedFileUrl: string | null = null;
    try {
      signedFileUrl = await stampDocumentWithSignature({
        documentId: doc.id,
        originalFileUrl: doc.file_url,
        documentTitle: doc.title,
        signatureDataUrl: signature_data_url,
        position: {
          ...parsedPos,
          signerName: finalSignerName,
          signerRole: finalSignerRole,
          signedAt: new Date().toLocaleString('id-ID'),
        },
      });
    } catch (e) {
      console.warn('Error stamping internal signed document:', e);
    }

    const posString = parsedPos ? JSON.stringify(parsedPos) : null;

    await pool.query(`
      UPDATE app_signed_documents 
      SET 
        status = 'signed',
        signature_data_url = ?,
        signed_file_url = COALESCE(?, signed_file_url),
        signature_position = COALESCE(?, signature_position),
        signer_name = ?,
        signer_role = ?,
        signed_at = NOW()
      WHERE id = ?
    `, [signature_data_url, signedFileUrl, posString, finalSignerName, finalSignerRole, id]);

    res.json({ 
      success: true, 
      message: 'Dokumen internal berhasil ditandatangani dan dibubuhkan langsung ke file PDF!',
      signed_file_url: signedFileUrl,
    });
  } catch (error: any) {
    console.error('Error signing internal document:', error);
    res.status(500).json({ error: error.message });
  }
});

// 10.6 Delete Signed Document
projectAppRouter.delete('/documents/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    await pool.query(`DELETE FROM app_signed_documents WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Dokumen berhasil dihapus.' });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 11. SAVED SIGNATURES (SIMPAN TANDA TANGAN INTERNAL)
// ==========================================

// 11.1 Get all saved signatures (hanya untuk internal user)
projectAppRouter.get('/saved-signatures', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { user_id } = req.query;

    let query = 'SELECT * FROM app_saved_signatures ORDER BY created_at DESC';
    let params: any[] = [];

    if (user_id) {
      query = 'SELECT * FROM app_saved_signatures WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC';
      params = [user_id];
    }

    const [rows]: any = await pool.query(query, params);
    res.json(rows || []);
  } catch (error: any) {
    console.error('Error fetching saved signatures:', error);
    res.status(500).json({ error: error.message });
  }
});

// 11.2 Save a new signature (hanya untuk ttd internal)
projectAppRouter.post('/saved-signatures', async (req: Request, res: Response) => {
  try {
    const { name, signature_data_url, user_id, created_by } = req.body;

    if (!signature_data_url) {
      return res.status(400).json({ error: 'Goresan tanda tangan wajib diisi.' });
    }

    const sigId = `sig-${Date.now()}`;
    const sigName = name && name.trim() ? name.trim() : `TTD ${new Date().toLocaleDateString('id-ID')}`;

    const pool = getPool();
    await pool.query(`
      INSERT INTO app_saved_signatures (id, name, signature_data_url, user_id, created_by)
      VALUES (?, ?, ?, ?, ?)
    `, [sigId, sigName, signature_data_url, user_id || null, created_by || 'User']);

    res.json({
      success: true,
      id: sigId,
      message: 'Tanda tangan berhasil disimpan untuk TTD Internal!',
    });
  } catch (error: any) {
    console.error('Error saving signature:', error);
    res.status(500).json({ error: error.message });
  }
});

// 11.3 Delete saved signature
projectAppRouter.delete('/saved-signatures/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    await pool.query('DELETE FROM app_saved_signatures WHERE id = ?', [id]);
    res.json({ success: true, message: 'Tanda tangan tersimpan berhasil dihapus.' });
  } catch (error: any) {
    console.error('Error deleting saved signature:', error);
    res.status(500).json({ error: error.message });
  }
});



