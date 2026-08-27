import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { defaultSeedData } from './seed-data.js';
import { hashPassword } from './auth.js';

const dbPath = path.join(process.cwd(), 'cv_database.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initDatabase(db);
  }
  return db;
}

function initDatabase(database) {
  // 1. Profile table
  database.exec(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY DEFAULT 1,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      bio TEXT,
      email TEXT,
      phone TEXT,
      location TEXT,
      avatar_url TEXT,
      github TEXT,
      linkedin TEXT,
      twitter TEXT,
      website TEXT,
      resume_url TEXT
    )
  `);

  // 2. Experiences table
  database.exec(`
    CREATE TABLE IF NOT EXISTS experiences (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT,
      start_date TEXT,
      end_date TEXT,
      current INTEGER DEFAULT 0,
      description TEXT,
      achievements TEXT,
      display_order INTEGER DEFAULT 0
    )
  `);

  // 3. Education table
  database.exec(`
    CREATE TABLE IF NOT EXISTS education (
      id TEXT PRIMARY KEY,
      degree TEXT NOT NULL,
      institution TEXT NOT NULL,
      location TEXT,
      start_date TEXT,
      end_date TEXT,
      gpa TEXT,
      description TEXT,
      display_order INTEGER DEFAULT 0
    )
  `);

  // 4. Skills table
  database.exec(`
    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      proficiency INTEGER DEFAULT 80,
      icon TEXT,
      display_order INTEGER DEFAULT 0
    )
  `);

  // 5. Projects table
  database.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      image_url TEXT,
      live_url TEXT,
      github_url TEXT,
      tags TEXT,
      featured INTEGER DEFAULT 0,
      display_order INTEGER DEFAULT 0
    )
  `);

  // 6. Messages table (from Contact Form)
  database.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  // 7. Users / Admin Table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY DEFAULT 1,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  // 8. Database Sessions Table
  database.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_token TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_active_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    )
  `);

  // Migration: Ensure display_order column exists on existing DB
  try { database.exec('ALTER TABLE experiences ADD COLUMN display_order INTEGER DEFAULT 0'); } catch (e) {}
  try { database.exec('ALTER TABLE education ADD COLUMN display_order INTEGER DEFAULT 0'); } catch (e) {}
  try { database.exec('ALTER TABLE skills ADD COLUMN display_order INTEGER DEFAULT 0'); } catch (e) {}
  try { database.exec('ALTER TABLE projects ADD COLUMN display_order INTEGER DEFAULT 0'); } catch (e) {}

  // Seed admin user if empty
  const userCount = database.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const defaultPasswordHash = hashPassword('admin123');
    database.prepare(`
      INSERT INTO users (id, username, password_hash, created_at)
      VALUES (1, 'admin', ?, ?)
    `).run(defaultPasswordHash, new Date().toISOString());
  }

  // Seed default CV data if profile table is empty
  const profileCount = database.prepare('SELECT COUNT(*) as count FROM profile').get().count;
  if (profileCount === 0) {
    seedDatabase(database);
  }
}

export function seedDatabase(database = getDb()) {
  const { profile, experiences, education, skills, projects } = defaultSeedData;

  // Clear existing
  database.exec('DELETE FROM profile');
  database.exec('DELETE FROM experiences');
  database.exec('DELETE FROM education');
  database.exec('DELETE FROM skills');
  database.exec('DELETE FROM projects');

  // Insert profile
  const insertProfile = database.prepare(`
    INSERT INTO profile (id, name, title, bio, email, phone, location, avatar_url, github, linkedin, twitter, website, resume_url)
    VALUES (1, @name, @title, @bio, @email, @phone, @location, @avatar_url, @github, @linkedin, @twitter, @website, @resume_url)
  `);
  insertProfile.run(profile);

  // Insert experiences
  const insertExp = database.prepare(`
    INSERT INTO experiences (id, role, company, location, start_date, end_date, current, description, achievements, display_order)
    VALUES (@id, @role, @company, @location, @start_date, @end_date, @current, @description, @achievements, @display_order)
  `);
  for (const exp of experiences) {
    insertExp.run(exp);
  }

  // Insert education
  const insertEdu = database.prepare(`
    INSERT INTO education (id, degree, institution, location, start_date, end_date, gpa, description, display_order)
    VALUES (@id, @degree, @institution, @location, @start_date, @end_date, @gpa, @description, @display_order)
  `);
  for (const edu of education) {
    insertEdu.run(edu);
  }

  // Insert skills
  const insertSkill = database.prepare(`
    INSERT INTO skills (id, name, category, proficiency, icon, display_order)
    VALUES (@id, @name, @category, @proficiency, @icon, @display_order)
  `);
  for (const sk of skills) {
    insertSkill.run(sk);
  }

  // Insert projects
  const insertProj = database.prepare(`
    INSERT INTO projects (id, title, description, category, image_url, live_url, github_url, tags, featured, display_order)
    VALUES (@id, @title, @description, @category, @image_url, @live_url, @github_url, @tags, @featured, @display_order)
  `);
  for (const proj of projects) {
    insertProj.run(proj);
  }
}

export function getFullCvData() {
  const database = getDb();

  const profile = database.prepare('SELECT * FROM profile WHERE id = 1').get() || {};
  const experiences = database.prepare('SELECT * FROM experiences ORDER BY display_order ASC, current DESC, id DESC').all();
  const education = database.prepare('SELECT * FROM education ORDER BY display_order ASC, id DESC').all();
  const skills = database.prepare('SELECT * FROM skills ORDER BY display_order ASC, category, proficiency DESC').all();
  const projects = database.prepare('SELECT * FROM projects ORDER BY display_order ASC, featured DESC').all();

  // Parse JSON strings back to objects/arrays
  const parsedExperiences = experiences.map(e => ({
    ...e,
    achievements: e.achievements ? JSON.parse(e.achievements) : []
  }));

  const parsedProjects = projects.map(p => ({
    ...p,
    tags: p.tags ? JSON.parse(p.tags) : []
  }));

  return {
    profile,
    experiences: parsedExperiences,
    education,
    skills,
    projects: parsedProjects
  };
}

export default getDb;
