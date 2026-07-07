-- Ubah tipe data logo_url menjadi MEDIUMTEXT untuk menampung base64 yang panjang
ALTER TABLE client_brands MODIFY COLUMN logo_url MEDIUMTEXT NULL;
