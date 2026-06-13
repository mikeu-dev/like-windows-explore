import { DbType } from "../connection";
import { files } from "../schema";
import { SeededFolderIds } from "./folders.seed";

export async function seedFiles(db: DbType, folderIds: SeededFolderIds) {
  await db.insert(files).values([
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
    { name: "vscode_installer.deb", size: 89000000, folderId: folderIds.downloadFolder.id }
  ]);
}
