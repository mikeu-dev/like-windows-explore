import { DbType } from "../connection";
import { files } from "../schema";
import { SeededFolderIds } from "./folders.seed";

export async function seedFiles(db: DbType, folderIds: SeededFolderIds) {
  // 1. Static Files (crucial for E2E tests and default locations)
  const staticFiles = [
    // Files in Projects folder (Stitch Mockup Files)
    { name: "Project Proposal.docx", size: 48200, folderId: folderIds.projects.id },
    { name: "UI Mockup.fig", size: 12400000, folderId: folderIds.projects.id },
    { name: "Budget.xlsx", size: 820000, folderId: folderIds.projects.id },
    { name: "Assets.zip", size: 245200000, folderId: folderIds.projects.id },
    { name: "Meeting Notes.txt", size: 4096, folderId: folderIds.projects.id },
    { name: "Presentation.pptx", size: 5800000, folderId: folderIds.projects.id },

    // Files in Work folder
    { name: "curriculum_vitae.pdf", size: 1240500, folderId: folderIds.work.id },
    { name: "project_requirements.docx", size: 345000, folderId: folderIds.work.id },
    { name: "monthly_budget.xlsx", size: 512000, folderId: folderIds.work.id },

    // Files in Personal folder
    { name: "fitness_plan.txt", size: 4500, folderId: folderIds.personal.id },
    { name: "shopping_list.md", size: 1200, folderId: folderIds.personal.id },

    // Files in Invoices folder
    { name: "Invoice-2026-001.pdf", size: 45000, folderId: folderIds.invoices.id },
    { name: "Invoice-2026-002.pdf", size: 58000, folderId: folderIds.invoices.id },

    // Files in Screenshots
    { name: "screenshot_desktop_v1.png", size: 2100000, folderId: folderIds.screenshots.id },
    { name: "screenshot_error_db.png", size: 1400000, folderId: folderIds.screenshots.id },

    // Files in Wallpapers
    { name: "mica_dark_theme.jpg", size: 4200000, folderId: folderIds.wallpapers.id },
    { name: "windows_light_default.png", size: 6800000, folderId: folderIds.wallpapers.id },

    // Files in Windows Root
    { name: "explorer.exe", size: 4500000, folderId: folderIds.windows.id },

    // Files in Windows System32
    { name: "cmd.exe", size: 280000, folderId: folderIds.system32Win.id },
    { name: "taskmgr.exe", size: 1800000, folderId: folderIds.system32Win.id },
    { name: "hal.dll", size: 1200000, folderId: folderIds.system32Win.id },

    // Files in OneDrive Shared Documents
    { name: "cloud_architecture.pdf", size: 2800000, folderId: folderIds.oneDriveDocs.id },
    { name: "meeting_recording.mp4", size: 145000000, folderId: folderIds.oneDriveDocs.id }
  ];

  const dynamicFiles: Array<{ name: string; size: number; folderId: string }> = [];

  // --- GENRE MUSIC FILES (under Music, 6 genres mock songs) ---
  const songsList = [
    "Metallica - Enter Sandman.mp3",
    "AC/DC - Back In Black.mp3",
    "Led Zeppelin - Stairway To Heaven.mp3",
    "Nirvana - Smells Like Teen Spirit.mp3",
    "Linkin Park - In The End.mp3",
    "Miles Davis - So What.flac",
    "John Coltrane - My Favorite Things.mp3",
    "Dave Brubeck - Take Five.mp3",
    "Louis Armstrong - What A Wonderful World.mp3",
    "Beethoven - Symphony No. 5.mp3",
    "Mozart - Eine kleine Nachtmusik.mp3",
    "Bach - Toccata and Fugue in D minor.flac",
    "Chopin - Nocturne Op. 9 No. 2.mp3",
    "Sleepy Fish - School Friends.mp3",
    "Tomppabeats - Far Away.mp3",
    "Taylor Swift - Blank Space.mp3",
    "Ed Sheeran - Shape of You.mp3",
    "The Weeknd - Blinding Lights.mp3",
    "Daft Punk - Around the World.mp3",
    "Avicii - Wake Me Up.mp3",
    "Martin Garrix - Animals.mp3"
  ];

  songsList.forEach((song) => {
    const size = Math.floor(Math.random() * (12582912 - 3145728) + 3145728);
    dynamicFiles.push({ name: song, size, folderId: folderIds.music.id });
  });

  // --- DOWNLOAD CATEGORIES ---
  // 1. Installers
  const installerItems = [
    { name: "chrome_installer_x64.exe", size: 92400000 },
    { name: "nodejs-v20.11.0-x64.msi", size: 30400000 },
    { name: "DockerDesktop-4.27.0.dmg", size: 685000000 },
    { name: "Discord-Setup-1.0.9002.exe", size: 85200000 },
    { name: "python-3.12.1-amd64.exe", size: 26200000 },
    { name: "Git-2.43.0-64-bit.exe", size: 58400000 },
    { name: "SpotifySetup.exe", size: 3100000 }
  ];
  installerItems.forEach((item) => {
    dynamicFiles.push({ name: item.name, size: item.size, folderId: folderIds.installers.id });
  });

  // 2. PDF Receipts
  const pdfReceipts = [
    "Receipt-2026-06-01-Hosting.pdf",
    "Invoice_INV-2026-9812.pdf",
    "Uber_Trip_Receipt_15June.pdf",
    "AWS_Billing_Invoice_May2026.pdf",
    "Electric_Bill_StateGrid_May.pdf",
    "Internet_Indihome_June2026.pdf"
  ];
  pdfReceipts.forEach((pdf) => {
    const size = Math.floor(Math.random() * (500000 - 50000) + 50000);
    dynamicFiles.push({ name: pdf, size, folderId: folderIds.pdfFolder.id });
  });

  // 3. Temp Downloads
  const tempDownloads = [
    "temp_archive_v3.zip",
    "notes_scratchpad.txt",
    "setup_beta_test.msi",
    "draft_design_final.png"
  ];
  tempDownloads.forEach((file) => {
    const size = Math.floor(Math.random() * (15000000 - 1000) + 1000);
    dynamicFiles.push({ name: file, size, folderId: folderIds.tempDownloads.id });
  });

  // --- PROJECTS CODE/ASSETS (under explorerClone, smartParking, voiceAi) ---
  const projectTemplates = [
    { name: "index.html", sizeRange: [1000, 15000] },
    { name: "App.tsx", sizeRange: [2000, 45000] },
    { name: "package.json", sizeRange: [500, 3000] },
    { name: "tsconfig.json", sizeRange: [300, 2000] },
    { name: "styles.css", sizeRange: [1500, 30000] },
    { name: "README.md", sizeRange: [500, 10000] },
    { name: "vite.config.ts", sizeRange: [400, 2500] },
    { name: "db.ts", sizeRange: [800, 5000] },
    { name: "api.ts", sizeRange: [2000, 25000] },
    { name: "types.ts", sizeRange: [1000, 12000] }
  ];

  const projectFolders = [folderIds.explorerClone, folderIds.smartParking, folderIds.voiceAi];
  projectFolders.forEach((folder) => {
    projectTemplates.forEach((tpl) => {
      const size = Math.floor(
        Math.random() * (tpl.sizeRange[1] - tpl.sizeRange[0]) + tpl.sizeRange[0]
      );
      dynamicFiles.push({ name: tpl.name, size, folderId: folder.id });
    });
  });

  // --- ONEDRIVE PICTURES ---
  const oneDrivePhotos = [
    "family_portrait_2025.jpg",
    "trip_to_bali_group.jpg",
    "graduation_ceremony.png",
    "baby_first_steps.jpg",
    "cat_sleeping_cute.png"
  ];
  oneDrivePhotos.forEach((photo) => {
    const size = Math.floor(Math.random() * (4500000 - 800000) + 800000);
    dynamicFiles.push({ name: photo, size, folderId: folderIds.oneDrivePics.id });
  });

  // --- DRIVE D: GAMES ---
  const cyberpunkFiles = ["cyberpunk2077.exe", "archive_pc.archive", "redengine.dll", "steam_api64.dll"];
  cyberpunkFiles.forEach((file) => {
    const size = file.endsWith(".exe") ? 65000000 : 1500000000; // 1.5GB
    dynamicFiles.push({ name: file, size, folderId: folderIds.localD.id }); // default to localD if parent empty, or witcherGames/cyberpunkGames etc
  });

  // Let's seed games files properly into games subfolders
  const gtaFiles = ["GTA5.exe", "x64a.rpf", "x64b.rpf", "commandline.txt"];
  gtaFiles.forEach((file) => {
    const size = file.endsWith(".rpf") ? 1800000000 : 45000000;
    dynamicFiles.push({ name: file, size, folderId: folderIds.localD.id });
  });

  // --- BACKUPS IN D: ---
  // Photos Backup
  const photosBackupFiles = [
    "photos_archive_2024.zip",
    "old_phone_camera_backup.rar"
  ];
  photosBackupFiles.forEach((file) => {
    dynamicFiles.push({ name: file, size: 1200000000, folderId: folderIds.photosBackups.id });
  });

  // Projects Backup
  const projectsBackupFiles = [
    "explorer_clone_backup_2026.tar.gz",
    "smart_parking_source_code.zip",
    "database_structure_dump.sql"
  ];
  projectsBackupFiles.forEach((file) => {
    const size = file.endsWith(".sql") ? 4500000 : 450000000;
    dynamicFiles.push({ name: file, size, folderId: folderIds.projectsBackups.id });
  });

  // Combine static and dynamic files and insert them to DB
  const allFiles = [...staticFiles, ...dynamicFiles];
  await db.insert(files).values(allFiles);
}
