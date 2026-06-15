import { DbType } from "../connection";
import { folders } from "../schema";

async function createFolder(db: DbType, name: string, parentId: string | null) {
  const [result] = await db.insert(folders).values({ name, parentId }).returning();
  return result;
}

export async function seedFolders(db: DbType) {
  // --- ROOT LEVEL DRIVES ---
  const localC = await createFolder(db, "Local Disk (C:)", null);
  const localD = await createFolder(db, "Local Disk (D:)", null);

  // --- SUBFOLDERS UNDER C: ---
  const progFiles = await createFolder(db, "Program Files", localC.id);
  const progFilesX86 = await createFolder(db, "Program Files (x86)", localC.id);
  const progData = await createFolder(db, "ProgramData", localC.id);
  const users = await createFolder(db, "Users", localC.id);
  const windows = await createFolder(db, "Windows", localC.id);
  const intel = await createFolder(db, "Intel", localC.id);
  const perfLogs = await createFolder(db, "PerfLogs", localC.id);
  const recovery = await createFolder(db, "Recovery", localC.id);
  const sysVolInfo = await createFolder(db, "System Volume Information", localC.id);
  const tools = await createFolder(db, "Tools", localC.id);
  const xampp = await createFolder(db, "xampp", localC.id);

  // --- SUBFOLDERS UNDER C:\Program Files ---
  const commonFilesCF = await createFolder(db, "Common Files", progFiles.id);
  const googlePF = await createFolder(db, "Google", progFiles.id);
  const msOfficePF = await createFolder(db, "Microsoft Office", progFiles.id);
  const msVSCodePF = await createFolder(db, "Microsoft VS Code", progFiles.id);
  const nodejsPF = await createFolder(db, "Nodejs", progFiles.id);
  const postgresPF = await createFolder(db, "PostgreSQL", progFiles.id);
  const windowsAppsPF = await createFolder(db, "WindowsApps", progFiles.id);

  // Nested C:\Program Files\Google\Chrome
  const chromePF = await createFolder(db, "Chrome", googlePF.id);

  // Nested C:\Program Files\PostgreSQL\16
  const postgres16PF = await createFolder(db, "16", postgresPF.id);

  // --- SUBFOLDERS UNDER C:\Program Files (x86) ---
  const commonFilesX86 = await createFolder(db, "Common Files", progFilesX86.id);
  const microsoftX86 = await createFolder(db, "Microsoft", progFilesX86.id);
  const steamX86 = await createFolder(db, "Steam", progFilesX86.id);

  // --- SUBFOLDERS UNDER C:\ProgramData ---
  const dockerPD = await createFolder(db, "Docker", progData.id);
  const microsoftPD = await createFolder(db, "Microsoft", progData.id);
  const pkgCachePD = await createFolder(db, "Package Cache", progData.id);
  const chocolateyPD = await createFolder(db, "chocolatey", progData.id);

  // --- SUBFOLDERS UNDER C:\Users ---
  const defaultUser = await createFolder(db, "Default", users.id);
  const publicUser = await createFolder(db, "Public", users.id);
  const mikeudevUser = await createFolder(db, "mikeudev", users.id);

  // --- SUBFOLDERS UNDER C:\Users\Public ---
  const publicDocs = await createFolder(db, "Documents", publicUser.id);
  const publicDownloads = await createFolder(db, "Downloads", publicUser.id);
  const publicPics = await createFolder(db, "Pictures", publicUser.id);

  // --- SUBFOLDERS UNDER C:\Users\mikeudev ---
  const contacts = await createFolder(db, "Contacts", mikeudevUser.id);
  const desktop = await createFolder(db, "Desktop", mikeudevUser.id);
  const documents = await createFolder(db, "Documents", mikeudevUser.id);
  const downloads = await createFolder(db, "Downloads", mikeudevUser.id);
  const music = await createFolder(db, "Music", mikeudevUser.id);
  const oneDrive = await createFolder(db, "OneDrive", mikeudevUser.id);
  const pictures = await createFolder(db, "Pictures", mikeudevUser.id);
  const videos = await createFolder(db, "Videos", mikeudevUser.id);
  const appData = await createFolder(db, "AppData", mikeudevUser.id);
  const sshFolder = await createFolder(db, ".ssh", mikeudevUser.id);

  // Subfolders under Desktop
  const projects = await createFolder(db, "Projects", desktop.id);
  const shortcuts = await createFolder(db, "Shortcuts", desktop.id);

  // Subfolders under Desktop\Projects
  const explorerClone = await createFolder(db, "explorer-clone", projects.id);
  const smartParking = await createFolder(db, "smart-parking", projects.id);
  const voiceAi = await createFolder(db, "voice-ai", projects.id);

  // Subfolders under Documents
  const invoices = await createFolder(db, "Invoices", documents.id);
  const personal = await createFolder(db, "Personal", documents.id);
  const work = await createFolder(db, "Work", documents.id);
  const archive = await createFolder(db, "Archive", documents.id);

  // Subfolders under Downloads
  const installers = await createFolder(db, "Installers", downloads.id);
  const pdfFolder = await createFolder(db, "PDF", downloads.id);
  const tempDownloads = await createFolder(db, "Temp", downloads.id);

  // Subfolders under OneDrive
  const oneDriveDocs = await createFolder(db, "Documents", oneDrive.id);
  const oneDrivePics = await createFolder(db, "Pictures", oneDrive.id);

  // Subfolders under Pictures
  const screenshots = await createFolder(db, "Screenshots", pictures.id);
  const wallpapers = await createFolder(db, "Wallpapers", pictures.id);

  // Subfolders under AppData
  const appDataLocal = await createFolder(db, "Local", appData.id);
  const appDataLocalLow = await createFolder(db, "LocalLow", appData.id);
  const appDataRoaming = await createFolder(db, "Roaming", appData.id);

  // Subfolders under AppData\Local
  const dockerLocal = await createFolder(db, "Docker", appDataLocal.id);
  const googleLocal = await createFolder(db, "Google", appDataLocal.id);
  const microsoftLocal = await createFolder(db, "Microsoft", appDataLocal.id);
  const programsLocal = await createFolder(db, "Programs", appDataLocal.id);

  // Subfolders under AppData\Roaming
  const codeRoaming = await createFolder(db, "Code", appDataRoaming.id);
  const npmRoaming = await createFolder(db, "npm", appDataRoaming.id);
  const postmanRoaming = await createFolder(db, "Postman", appDataRoaming.id);

  // --- SUBFOLDERS UNDER C:\Windows ---
  const fontsWin = await createFolder(db, "Fonts", windows.id);
  const logsWin = await createFolder(db, "Logs", windows.id);
  const system32Win = await createFolder(db, "System32", windows.id);
  const tempWin = await createFolder(db, "Temp", windows.id);
  const winSxSWin = await createFolder(db, "WinSxS", windows.id);

  // --- SUBFOLDERS UNDER C:\Tools ---
  const gitTools = await createFolder(db, "Git", tools.id);
  const pythonTools = await createFolder(db, "Python", tools.id);
  const scriptsTools = await createFolder(db, "Scripts", tools.id);

  // --- SUBFOLDERS UNDER C:\xampp ---
  const apacheXampp = await createFolder(db, "apache", xampp.id);
  const htdocsXampp = await createFolder(db, "htdocs", xampp.id);
  const mysqlXampp = await createFolder(db, "mysql", xampp.id);

  // --- SUBFOLDERS UNDER D: ---
  const gamesD = await createFolder(db, "Games", localD.id);
  const moviesD = await createFolder(db, "Movies", localD.id);
  const backupsD = await createFolder(db, "Backups", localD.id);

  // Subfolders under Games
  const cyberpunkGames = await createFolder(db, "Cyberpunk 2077", gamesD.id);
  const gtaGames = await createFolder(db, "Grand Theft Auto V", gamesD.id);
  const witcherGames = await createFolder(db, "The Witcher 3", gamesD.id);

  // Subfolders under Movies
  const actionMovies = await createFolder(db, "Action", moviesD.id);
  const comedyMovies = await createFolder(db, "Comedy", moviesD.id);
  const sciFiMovies = await createFolder(db, "Sci-Fi", moviesD.id);

  // Subfolders under Backups
  const photosBackups = await createFolder(db, "Photos", backupsD.id);
  const projectsBackups = await createFolder(db, "Projects", backupsD.id);

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
