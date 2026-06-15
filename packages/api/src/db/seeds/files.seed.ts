import { DbType } from "../connection";
import { files } from "../schema";
import { SeededFolderIds } from "./folders.seed";

export async function seedFiles(db: DbType, folderIds: SeededFolderIds) {
  await db.insert(files).values([
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
    { name: "windows_11_iso.iso", size: 5400000000, folderId: folderIds.downloadFolder.id },

    // Files in OneDrive Shared Documents
    { name: "cloud_architecture.pdf", size: 2800000, folderId: folderIds.oneDriveDocs.id },
    { name: "meeting_recording.mp4", size: 145000000, folderId: folderIds.oneDriveDocs.id }
  ]);
}
