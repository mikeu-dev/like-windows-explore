import { DbType } from "../connection";
import { folders } from "../schema";

export async function seedFolders(db: DbType) {
  // --- DRIVE C: ---
  const [localC] = await db.insert(folders).values([
    { name: "Local Disk (C:)", parentId: null }
  ]).returning();

  // --- DRIVE D: ---
  const [localD] = await db.insert(folders).values([
    { name: "Local Disk (D:)", parentId: null }
  ]).returning();

  // --- SUBFOLDERS UNDER C: ---
  const [progFiles, progFilesX86, progData, users, windows, intel, perfLogs, recovery, sysVolInfo, tools, xampp] = await db
    .insert(folders)
    .values([
      { name: "Program Files", parentId: localC.id },
      { name: "Program Files (x86)", parentId: localC.id },
      { name: "ProgramData", parentId: localC.id },
      { name: "Users", parentId: localC.id },
      { name: "Windows", parentId: localC.id },
      { name: "Intel", parentId: localC.id },
      { name: "PerfLogs", parentId: localC.id },
      { name: "Recovery", parentId: localC.id },
      { name: "System Volume Information", parentId: localC.id },
      { name: "Tools", parentId: localC.id },
      { name: "xampp", parentId: localC.id }
    ])
    .returning();

  // --- SUBFOLDERS UNDER C:\Program Files ---
  const [commonFilesCF, googlePF, msOfficePF, msVSCodePF, nodejsPF, postgresPF, windowsAppsPF] = await db
    .insert(folders)
    .values([
      { name: "Common Files", parentId: progFiles.id },
      { name: "Google", parentId: progFiles.id },
      { name: "Microsoft Office", parentId: progFiles.id },
      { name: "Microsoft VS Code", parentId: progFiles.id },
      { name: "Nodejs", parentId: progFiles.id },
      { name: "PostgreSQL", parentId: progFiles.id },
      { name: "WindowsApps", parentId: progFiles.id }
    ])
    .returning();

  // Nested C:\Program Files\Google\Chrome
  const [chromePF] = await db
    .insert(folders)
    .values([{ name: "Chrome", parentId: googlePF.id }])
    .returning();

  // Nested C:\Program Files\PostgreSQL\16
  const [postgres16PF] = await db
    .insert(folders)
    .values([{ name: "16", parentId: postgresPF.id }])
    .returning();

  // --- SUBFOLDERS UNDER C:\Program Files (x86) ---
  const [commonFilesX86, microsoftX86, steamX86] = await db
    .insert(folders)
    .values([
      { name: "Common Files", parentId: progFilesX86.id },
      { name: "Microsoft", parentId: progFilesX86.id },
      { name: "Steam", parentId: progFilesX86.id }
    ])
    .returning();

  // --- SUBFOLDERS UNDER C:\ProgramData ---
  const [dockerPD, microsoftPD, pkgCachePD, chocolateyPD] = await db
    .insert(folders)
    .values([
      { name: "Docker", parentId: progData.id },
      { name: "Microsoft", parentId: progData.id },
      { name: "Package Cache", parentId: progData.id },
      { name: "chocolatey", parentId: progData.id }
    ])
    .returning();

  // --- SUBFOLDERS UNDER C:\Users ---
  const [defaultUser, publicUser, mikeudevUser] = await db
    .insert(folders)
    .values([
      { name: "Default", parentId: users.id },
      { name: "Public", parentId: users.id },
      { name: "mikeudev", parentId: users.id }
    ])
    .returning();

  // --- SUBFOLDERS UNDER C:\Users\Public ---
  const [publicDocs, publicDownloads, publicPics] = await db
    .insert(folders)
    .values([
      { name: "Documents", parentId: publicUser.id },
      { name: "Downloads", parentId: publicUser.id },
      { name: "Pictures", parentId: publicUser.id }
    ])
    .returning();

  // --- SUBFOLDERS UNDER C:\Users\mikeudev ---
  const [contacts, desktop, documents, downloads, music, oneDrive, pictures, videos, appData, sshFolder] = await db
    .insert(folders)
    .values([
      { name: "Contacts", parentId: mikeudevUser.id },
      { name: "Desktop", parentId: mikeudevUser.id },
      { name: "Documents", parentId: mikeudevUser.id },
      { name: "Downloads", parentId: mikeudevUser.id },
      { name: "Music", parentId: mikeudevUser.id },
      { name: "OneDrive", parentId: mikeudevUser.id },
      { name: "Pictures", parentId: mikeudevUser.id },
      { name: "Videos", parentId: mikeudevUser.id },
      { name: "AppData", parentId: mikeudevUser.id },
      { name: ".ssh", parentId: mikeudevUser.id }
    ])
    .returning();

  // Subfolders under Desktop
  const [projects, shortcuts] = await db
    .insert(folders)
    .values([
      { name: "Projects", parentId: desktop.id },
      { name: "Shortcuts", parentId: desktop.id }
    ])
    .returning();

  // Subfolders under Desktop\Projects
  const [explorerClone, smartParking, voiceAi] = await db
    .insert(folders)
    .values([
      { name: "explorer-clone", parentId: projects.id },
      { name: "smart-parking", parentId: projects.id },
      { name: "voice-ai", parentId: projects.id }
    ])
    .returning();

  // Subfolders under Documents
  const [invoices, personal, work, archive] = await db
    .insert(folders)
    .values([
      { name: "Invoices", parentId: documents.id },
      { name: "Personal", parentId: documents.id },
      { name: "Work", parentId: documents.id },
      { name: "Archive", parentId: documents.id }
    ])
    .returning();

  // Subfolders under Downloads
  const [installers, pdfFolder, tempDownloads] = await db
    .insert(folders)
    .values([
      { name: "Installers", parentId: downloads.id },
      { name: "PDF", parentId: downloads.id },
      { name: "Temp", parentId: downloads.id }
    ])
    .returning();

  // Subfolders under OneDrive
  const [oneDriveDocs, oneDrivePics] = await db
    .insert(folders)
    .values([
      { name: "Documents", parentId: oneDrive.id },
      { name: "Pictures", parentId: oneDrive.id }
    ])
    .returning();

  // Subfolders under Pictures
  const [screenshots, wallpapers] = await db
    .insert(folders)
    .values([
      { name: "Screenshots", parentId: pictures.id },
      { name: "Wallpapers", parentId: pictures.id }
    ])
    .returning();

  // Subfolders under AppData
  const [appDataLocal, appDataLocalLow, appDataRoaming] = await db
    .insert(folders)
    .values([
      { name: "Local", parentId: appData.id },
      { name: "LocalLow", parentId: appData.id },
      { name: "Roaming", parentId: appData.id }
    ])
    .returning();

  // Subfolders under AppData\Local
  const [dockerLocal, googleLocal, microsoftLocal, programsLocal] = await db
    .insert(folders)
    .values([
      { name: "Docker", parentId: appDataLocal.id },
      { name: "Google", parentId: appDataLocal.id },
      { name: "Microsoft", parentId: appDataLocal.id },
      { name: "Programs", parentId: appDataLocal.id }
    ])
    .returning();

  // Subfolders under AppData\Roaming
  const [codeRoaming, npmRoaming, postmanRoaming] = await db
    .insert(folders)
    .values([
      { name: "Code", parentId: appDataRoaming.id },
      { name: "npm", parentId: appDataRoaming.id },
      { name: "Postman", parentId: appDataRoaming.id }
    ])
    .returning();

  // --- SUBFOLDERS UNDER C:\Windows ---
  const [fontsWin, logsWin, system32Win, tempWin, winSxSWin] = await db
    .insert(folders)
    .values([
      { name: "Fonts", parentId: windows.id },
      { name: "Logs", parentId: windows.id },
      { name: "System32", parentId: windows.id },
      { name: "Temp", parentId: windows.id },
      { name: "WinSxS", parentId: windows.id }
    ])
    .returning();

  // --- SUBFOLDERS UNDER C:\Tools ---
  const [gitTools, pythonTools, scriptsTools] = await db
    .insert(folders)
    .values([
      { name: "Git", parentId: tools.id },
      { name: "Python", parentId: tools.id },
      { name: "Scripts", parentId: tools.id }
    ])
    .returning();

  // --- SUBFOLDERS UNDER C:\xampp ---
  const [apacheXampp, htdocsXampp, mysqlXampp] = await db
    .insert(folders)
    .values([
      { name: "apache", parentId: xampp.id },
      { name: "htdocs", parentId: xampp.id },
      { name: "mysql", parentId: xampp.id }
    ])
    .returning();

  // --- SUBFOLDERS UNDER D: ---
  const [gamesD, moviesD, backupsD] = await db
    .insert(folders)
    .values([
      { name: "Games", parentId: localD.id },
      { name: "Movies", parentId: localD.id },
      { name: "Backups", parentId: localD.id }
    ])
    .returning();

  // Subfolders under Games
  const [cyberpunkGames, gtaGames, witcherGames] = await db
    .insert(folders)
    .values([
      { name: "Cyberpunk 2077", parentId: gamesD.id },
      { name: "Grand Theft Auto V", parentId: gamesD.id },
      { name: "The Witcher 3", parentId: gamesD.id }
    ])
    .returning();

  // Subfolders under Movies
  const [actionMovies, comedyMovies, sciFiMovies] = await db
    .insert(folders)
    .values([
      { name: "Action", parentId: moviesD.id },
      { name: "Comedy", parentId: moviesD.id },
      { name: "Sci-Fi", parentId: moviesD.id }
    ])
    .returning();

  // Subfolders under Backups
  const [photosBackups, projectsBackups] = await db
    .insert(folders)
    .values([
      { name: "Photos", parentId: backupsD.id },
      { name: "Projects", parentId: backupsD.id }
    ])
    .returning();

  return {
    localC,
    localD,
    users,
    mikeudevUser,
    desktop,
    downloads,
    documents,
    pictures,
    music,
    oneDrive,
    videos,
    projects,
    explorerClone,
    smartParking,
    voiceAi,
    invoices,
    personal,
    work,
    archive,
    installers,
    pdfFolder,
    tempDownloads,
    oneDriveDocs,
    oneDrivePics,
    screenshots,
    wallpapers,
    windows,
    system32Win,
    gamesD,
    moviesD,
    backupsD,
    photosBackups,
    projectsBackups
  };
}

export type SeededFolderIds = Awaited<ReturnType<typeof seedFolders>>;
