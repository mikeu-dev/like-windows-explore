import { DbType } from "../connection";
import { files } from "../schema";
import { SeededFolderIds } from "./folders.seed";

export async function seedFiles(db: DbType, folderIds: SeededFolderIds) {
  // 1. Static Files (crucial for E2E tests and default locations)
  const staticFiles = [
    // Files in Projects folder (Stitch Mockup Files)
    { name: "Project Proposal.docx", size: 48200, folderId: folderIds.projectsFolder.id },
    { name: "UI Mockup.fig", size: 12400000, folderId: folderIds.projectsFolder.id },
    { name: "Budget.xlsx", size: 820000, folderId: folderIds.projectsFolder.id },
    { name: "Assets.zip", size: 245200000, folderId: folderIds.projectsFolder.id },
    { name: "Meeting Notes.txt", size: 4096, folderId: folderIds.projectsFolder.id },
    { name: "Presentation.pptx", size: 5800000, folderId: folderIds.projectsFolder.id },

    // Files in Work folder
    { name: "curriculum_vitae.pdf", size: 1240500, folderId: folderIds.workFolder.id },
    { name: "project_requirements.docx", size: 345000, folderId: folderIds.workFolder.id },
    { name: "monthly_budget.xlsx", size: 512000, folderId: folderIds.workFolder.id },

    // Files in Personal folder
    { name: "fitness_plan.txt", size: 4500, folderId: folderIds.personalFolder.id },
    { name: "shopping_list.md", size: 1200, folderId: folderIds.personalFolder.id },

    // Files in Vacation 2025 Folder
    { name: "beach_sunset.jpg", size: 4200000, folderId: folderIds.vacationFolder.id },
    { name: "group_photo.png", size: 6800000, folderId: folderIds.vacationFolder.id },

    // Files in Design Assets
    { name: "logo_primary.svg", size: 24000, folderId: folderIds.projectsPicFolder.id },
    { name: "color_palette.pdf", size: 1048576, folderId: folderIds.projectsPicFolder.id },
    { name: "wireframe_v1.png", size: 3145728, folderId: folderIds.projectsPicFolder.id },

    // Files in Taxes 2024 (deeply nested)
    { name: "w2_form_final.pdf", size: 890000, folderId: folderIds.taxes2024.id },
    { name: "tax_receipts_compiled.zip", size: 15400000, folderId: folderIds.taxes2024.id },

    // Files in Downloads
    { name: "bun_linux_x64.tar.gz", size: 45000000, folderId: folderIds.downloadFolder.id },
    { name: "vscode_installer.deb", size: 89000000, folderId: folderIds.downloadFolder.id },
    { name: "windows_11_iso.iso", size: 1850000000, folderId: folderIds.downloadFolder.id },

    // Files in OneDrive Shared Documents
    { name: "cloud_architecture.pdf", size: 2800000, folderId: folderIds.oneDriveDocs.id },
    { name: "meeting_recording.mp4", size: 145000000, folderId: folderIds.oneDriveDocs.id }
  ];

  const dynamicFiles: Array<{ name: string; size: number; folderId: string }> = [];

  // --- GENRE MUSIC FILES (6 folders) ---
  const musicTracksByGenre: Record<string, string[]> = {
    "Rock & Metal": [
      "Metallica - Enter Sandman.mp3",
      "AC/DC - Back In Black.mp3",
      "Led Zeppelin - Stairway To Heaven.mp3",
      "Nirvana - Smells Like Teen Spirit.mp3",
      "Linkin Park - In The End.mp3",
      "Iron Maiden - The Trooper.mp3",
      "System of a Down - Chop Suey!.mp3",
      "Slipknot - Duality.flac",
      "Guns N' Roses - Sweet Child O' Mine.mp3",
      "Foo Fighters - Everlong.mp3",
      "Black Sabbath - Paranoid.mp3",
      "Queen - Bohemian Rhapsody.flac",
      "Pink Floyd - Comfortably Numb.mp3",
      "Deep Purple - Smoke On The Water.mp3",
      "Rage Against The Machine - Killing In The Name.mp3"
    ],
    "Jazz & Blues": [
      "Miles Davis - So What.flac",
      "John Coltrane - My Favorite Things.mp3",
      "Dave Brubeck - Take Five.mp3",
      "Billie Holiday - Strange Fruit.mp3",
      "Louis Armstrong - What A Wonderful World.mp3",
      "B.B. King - The Thrill Is Gone.mp3",
      "Muddy Waters - Mannish Boy.mp3",
      "Ella Fitzgerald - Summertime.mp3",
      "Duke Ellington - Take The A Train.mp3",
      "Charlie Parker - Ornithology.mp3",
      "Thelonious Monk - Round Midnight.mp3",
      "Nina Simone - Feeling Good.flac",
      "Robert Johnson - Cross Road Blues.mp3",
      "Etta James - At Last.mp3",
      "Stevie Ray Vaughan - Pride and Joy.mp3"
    ],
    "Classical": [
      "Beethoven - Symphony No. 5.mp3",
      "Mozart - Eine kleine Nachtmusik.mp3",
      "Bach - Toccata and Fugue in D minor.flac",
      "Chopin - Nocturne Op. 9 No. 2.mp3",
      "Vivaldi - Four Seasons - Spring.mp3",
      "Debussy - Clair de Lune.mp3",
      "Tchaikovsky - Swan Lake Suite.mp3",
      "Pachelbel - Canon in D.mp3",
      "Grieg - In the Hall of the Mountain King.flac",
      "Beethoven - Moonlight Sonata.mp3",
      "Mozart - Requiem - Lacrimosa.mp3",
      "Bach - Air on the G String.mp3",
      "Ravel - Bolero.mp3",
      "Chopin - Waltz in E minor.mp3",
      "Handel - Messiah - Hallelujah.mp3"
    ],
    "Lo-Fi Beats": [
      "Sleepy Fish - School Friends.mp3",
      "Idealism - phantasia.mp3",
      "jinsang - smile from u.mp3",
      "potsu - im closing my eyes.mp3",
      "bsd.u - French Inhale.mp3",
      "SwuM - Show Me.mp3",
      "Wun Two - Again.mp3",
      "Tomppabeats - Far Away.mp3",
      "Kupla - Kingdom in the Clouds.mp3",
      "Saib - Spike Spiegel.mp3",
      "Elijah Who - sad and boujee.mp3",
      "Nujabes - Feather.mp3",
      "Lofi Girl - Study Session.mp3",
      "J Dilla - Don't Cry.mp3",
      "Kalaido - Hanging Lanterns.mp3"
    ],
    "Pop Favorites": [
      "Taylor Swift - Blank Space.mp3",
      "Ed Sheeran - Shape of You.mp3",
      "The Weeknd - Blinding Lights.mp3",
      "Dua Lipa - Levitating.mp3",
      "Billie Eilish - Bad Guy.flac",
      "Harry Styles - As It Was.mp3",
      "Bruno Mars - Uptown Funk.mp3",
      "Adele - Rolling in the Deep.mp3",
      "Coldplay - Viva La Vida.mp3",
      "Justin Bieber - Sorry.mp3",
      "Ariana Grande - 7 Rings.mp3",
      "Post Malone - Sunflower.mp3",
      "Olivia Rodrigo - Drivers License.mp3",
      "Drake - Hotline Bling.mp3",
      "Katy Perry - Roar.mp3"
    ],
    "Electronic & Dance": [
      "Daft Punk - Around the World.mp3",
      "Avicii - Wake Me Up.mp3",
      "Martin Garrix - Animals.mp3",
      "Swedish House Mafia - Don't You Worry Child.mp3",
      "Skrillex - Scary Monsters and Nice Sprites.mp3",
      "Deadmau5 - Strobe.flac",
      "Calvin Harris - Summer.mp3",
      "Marshmello - Alone.mp3",
      "The Chainsmokers - Closer.mp3",
      "Zedd - Clarity.mp3",
      "Flume - Never Be Like You.mp3",
      "Kygo - Firestone.mp3",
      "Tiësto - Adagio for Strings.mp3",
      "Disclosure - Latch.mp3",
      "Justice - D.A.N.C.E.mp3"
    ]
  };

  for (const folder of folderIds.genreFolders) {
    const tracks = musicTracksByGenre[folder.name];
    if (tracks) {
      tracks.forEach((track) => {
        // Generate random size between 3MB (3,145,728 bytes) and 12MB (12,582,912 bytes)
        const size = Math.floor(Math.random() * (12582912 - 3145728) + 3145728);
        dynamicFiles.push({ name: track, size, folderId: folder.id });
      });
    }
  }

  // --- DOWNLOAD CATEGORIES (4 folders) ---
  const downloadFilesByCategory: Record<string, Array<{ name: string; size: number }>> = {
    "Installers": [
      { name: "chrome_installer_x64.exe", size: 92400000 },
      { name: "nodejs-v20.11.0-x64.msi", size: 30400000 },
      { name: "DockerDesktop-4.27.0.dmg", size: 685000000 },
      { name: "Discord-Setup-1.0.9002.exe", size: 85200000 },
      { name: "python-3.12.1-amd64.exe", size: 26200000 },
      { name: "Git-2.43.0-64-bit.exe", size: 58400000 },
      { name: "SpotifySetup.exe", size: 3100000 },
      { name: "vlc-3.0.20-win64.exe", size: 42100000 },
      { name: "SteamSetup.exe", size: 2400000 },
      { name: "OBS-Studio-30.0.2-Full-Installer-x64.exe", size: 128000000 }
    ],
    "PDF Receipts": [
      { name: "Receipt-2026-06-01-Hosting.pdf", size: 145000 },
      { name: "Invoice_INV-2026-9812.pdf", size: 284000 },
      { name: "Uber_Trip_Receipt_15June.pdf", size: 98000 },
      { name: "AWS_Billing_Invoice_May2026.pdf", size: 512000 },
      { name: "Electric_Bill_StateGrid_May.pdf", size: 310000 },
      { name: "Internet_Indihome_June2026.pdf", size: 215000 },
      { name: "Gym_Membership_Receipt.pdf", size: 88000 },
      { name: "Steam_Purchase_Receipt.pdf", size: 104000 }
    ],
    "Zip Archives": [
      { name: "backup_20260531_production.zip", size: 1482000000 },
      { name: "vacation_photos_raw.rar", size: 450000000 },
      { name: "node_modules_backup.tar.gz", size: 245000000 },
      { name: "db_dump_postgres_v2.sql.gz", size: 89000000 },
      { name: "documents_scanned_2025.7z", size: 12000000 },
      { name: "wordpress_theme_custom.zip", size: 4200000 },
      { name: "source_code_archive.tgz", size: 67000000 }
    ],
    "Torrent Torrents": [
      { name: "ubuntu-24.04-desktop-amd64.iso.torrent", size: 154000 },
      { name: "debian-12.5.0-amd64-netinst.iso.torrent", size: 243000 },
      { name: "archlinux-2026.06.01-x86_64.iso.torrent", size: 88000 },
      { name: "alpine-standard-3.19.1-x86_64.iso.torrent", size: 12000 }
    ]
  };

  for (const folder of folderIds.downloadFolders) {
    const items = downloadFilesByCategory[folder.name];
    if (items) {
      items.forEach((item) => {
        dynamicFiles.push({ name: item.name, size: item.size, folderId: folder.id });
      });
    }
  }

  // --- PROJECTS CODE/ASSETS (5 folders) ---
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
    { name: "types.ts", sizeRange: [1000, 12000] },
    { name: "Component.tsx", sizeRange: [1500, 18000] },
    { name: "utils.ts", sizeRange: [500, 8000] }
  ];

  for (const folder of folderIds.projectFolders) {
    // Pick 8 random files from projectTemplates to make projects look realistic
    const selectedTemplates = projectTemplates
      .sort(() => 0.5 - Math.random())
      .slice(0, 8);

    selectedTemplates.forEach((tpl) => {
      const size = Math.floor(
        Math.random() * (tpl.sizeRange[1] - tpl.sizeRange[0]) + tpl.sizeRange[0]
      );
      dynamicFiles.push({ name: tpl.name, size, folderId: folder.id });
    });
  }

  // --- VACATION DAYS PHOTOS (4 folders) ---
  const photoNamesByDay: Record<string, string[]> = {
    "Day 1 - Arrival & Hotel": [
      "airport_arrival.jpg",
      "taxi_ride_city.jpg",
      "hotel_lobby_checkin.png",
      "room_view_sunset.jpg",
      "dinner_near_hotel.jpg",
      "swimming_pool_night.png"
    ],
    "Day 2 - Beach Picnic": [
      "morning_sand_beach.jpg",
      "coconut_drinks.jpg",
      "group_selfie_by_waves.jpg",
      "beach_volleyball_game.png",
      "sunset_golden_hour.jpg",
      "seafood_dinner_coast.jpg"
    ],
    "Day 3 - Mountain Hiking": [
      "trailhead_map_morning.png",
      "forest_walkway_green.jpg",
      "rocky_climb_steep.jpg",
      "summit_panoramic_view.jpg",
      "clouds_below_summit.jpg",
      "hiking_boots_dirty.png"
    ],
    "Day 4 - City Exploration": [
      "historic_temple_facade.jpg",
      "local_food_market.jpg",
      "street_art_mural.png",
      "shopping_mall_modern.jpg",
      "souvenirs_shop_gifts.jpg",
      "departure_flight_gate.jpg"
    ]
  };

  for (const folder of folderIds.vacationDayFolders) {
    const photos = photoNamesByDay[folder.name];
    if (photos) {
      photos.forEach((photo) => {
        // Size between 1MB (1,048,576 bytes) and 5MB (5,242,880 bytes)
        const size = Math.floor(Math.random() * (5242880 - 1048576) + 1048576);
        dynamicFiles.push({ name: photo, size, folderId: folder.id });
      });
    }
  }

  // --- PERSONAL SUBFOLDERS (3 folders) ---
  const personalFilesByFolder: Record<string, Array<{ name: string; size: number }>> = {
    "Finances & Taxes": [
      { name: "tax_worksheet_2025.xlsx", size: 450000 },
      { name: "investment_portfolio.xlsx", size: 1240000 },
      { name: "monthly_expenses_2026.csv", size: 85000 },
      { name: "crypto_transactions_history.csv", size: 142000 }
    ],
    "Fitness & Health": [
      { name: "workout_split_5day.md", size: 3200 },
      { name: "meal_prep_plan_june.pdf", size: 1240000 },
      { name: "calorie_macro_tracker.xlsx", size: 380000 },
      { name: "blood_test_results_may.pdf", size: 2150000 }
    ],
    "Travel Plans": [
      { name: "itinerary_tokyo_osaka_2026.pdf", size: 3450000 },
      { name: "hotel_bookings_confirmation.pdf", size: 890000 },
      { name: "flight_tickets_roundtrip.pdf", size: 1250000 },
      { name: "packing_checklist_summer.txt", size: 4200 }
    ]
  };

  for (const folder of folderIds.personalSubfolders) {
    const items = personalFilesByFolder[folder.name];
    if (items) {
      items.forEach((item) => {
        dynamicFiles.push({ name: item.name, size: item.size, folderId: folder.id });
      });
    }
  }

  // --- DATABASE & CONFIG BACKUPS (2 folders) ---
  const backupFilesByFolder: Record<string, Array<{ name: string; size: number }>> = {
    "Database Dumps": [
      { name: "prod_dump_2026_06_01.sql", size: 84500000 },
      { name: "dev_dump_2026_06_10.sql", size: 24100000 },
      { name: "users_table_backup.csv", size: 5400000 },
      { name: "postgres_dump_cluster.tar", size: 214000000 }
    ],
    "Config Backups": [
      { name: "nginx.conf.bak", size: 4500 },
      { name: "docker-compose.production.yml.bak", size: 2800 },
      { name: "env.production.local.bak", size: 1200 },
      { name: "prometheus.yml.bak", size: 3400 }
    ]
  };

  for (const folder of folderIds.backupFolders) {
    const items = backupFilesByFolder[folder.name];
    if (items) {
      items.forEach((item) => {
        dynamicFiles.push({ name: item.name, size: item.size, folderId: folder.id });
      });
    }
  }

  // Combine static and dynamic files and insert them to DB
  const allFiles = [...staticFiles, ...dynamicFiles];
  await db.insert(files).values(allFiles);
}

