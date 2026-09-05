import { Router, Request, Response } from 'express';
import { getPool } from '../db';

export const projectAppRouter = Router();

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
    const { brand_id, title, description, status, priority, start_date, due_date, progress, color } = req.body;
    const id = `proj-${Date.now().toString(36)}`;
    await pool.query(
      `INSERT INTO pm_projects (id, brand_id, title, description, status, priority, start_date, due_date, progress, color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, brand_id || null, title, description || '', status || 'planning', priority || 'medium', start_date || null, due_date || null, progress || 0, color || '#4f46e5']
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
    const { brand_id, title, description, status, priority, start_date, due_date, progress, color } = req.body;
    await pool.query(
      `UPDATE pm_projects 
       SET brand_id = ?, title = ?, description = ?, status = ?, priority = ?, start_date = ?, due_date = ?, progress = ?, color = ?
       WHERE id = ?`,
      [brand_id, title, description, status, priority, start_date, due_date, progress, color, id]
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
    const { project_id, title, description, status, priority, assignee_name, due_date, tags } = req.body;
    const id = `task-${Date.now().toString(36)}`;
    await pool.query(
      `INSERT INTO pm_tasks (id, project_id, title, description, status, priority, assignee_name, due_date, tags, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, project_id || null, title, description || '', status || 'todo', priority || 'medium', assignee_name || '', due_date || null, tags || '', 0]
    );
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
    const { project_id, title, description, status, priority, assignee_name, due_date, tags } = req.body;
    await pool.query(
      `UPDATE pm_tasks 
       SET project_id = ?, title = ?, description = ?, status = ?, priority = ?, assignee_name = ?, due_date = ?, tags = ?
       WHERE id = ?`,
      [project_id, title, description, status, priority, assignee_name, due_date, tags, id]
    );
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
      scheduled_at, status, assignee_copy, assignee_design, notes
    } = req.body;

    const id = `post-${Date.now().toString(36)}`;
    await pool.query(
      `INSERT INTO sm_content_posts 
       (id, brand_id, social_account_id, project_id, title, pillar_name, platform, content_type,
        hook, caption, hashtags, call_to_action, media_urls, scheduled_at, status, assignee_copy, assignee_design, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, brand_id || null, social_account_id || null, project_id || null, title,
        pillar_name || 'Edukasi & Tips', platform || 'instagram', content_type || 'feed_single',
        hook || '', caption || '', hashtags || '', call_to_action || '',
        JSON.stringify(media_urls || []), scheduled_at, status || 'idea',
        assignee_copy || '', assignee_design || '', notes || ''
      ]
    );
    res.json({ success: true, id, message: 'Postingan konten berhasil dijadwalkan' });
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
      scheduled_at, status, assignee_copy, assignee_design, notes, published_link
    } = req.body;

    await pool.query(
      `UPDATE sm_content_posts 
       SET brand_id = ?, social_account_id = ?, project_id = ?, title = ?, pillar_name = ?, platform = ?,
           content_type = ?, hook = ?, caption = ?, hashtags = ?, call_to_action = ?, media_urls = ?,
           scheduled_at = ?, status = ?, assignee_copy = ?, assignee_design = ?, notes = ?, published_link = ?
       WHERE id = ?`,
      [
        brand_id, social_account_id, project_id, title, pillar_name, platform,
        content_type, hook, caption, hashtags, call_to_action, JSON.stringify(media_urls || []),
        scheduled_at, status, assignee_copy, assignee_design, notes, published_link, id
      ]
    );
    res.json({ success: true, message: 'Konten berhasil diperbarui' });
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
