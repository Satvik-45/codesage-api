import path from "path";
const VALID_EXTENSIONS = [".js", ".ts", ".jsx", ".tsx", ".py", ".java", ".go", ".cpp", ".c", ".cs"];
const IGNORED_DIRECTORIES = ["node_modules", ".git", "dist", "build", ".next"];
const LANGUAGE_MAP: Record<string, string> = {
    ".js": "JavaScript",
    ".ts": "TypeScript",
    ".jsx": "JavaScript",
    ".tsx": "TypeScript",
    ".py": "Python",
    ".java": "Java",
    ".go": "Go",
    ".cpp": "C++",
    ".c": "C",
    ".cs": "C#",
};
export function isValidCodeFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return VALID_EXTENSIONS.includes(ext);
}
export function shouldIgnoreDirectory(dirName: string): boolean {
    return IGNORED_DIRECTORIES.includes(dirName);
}
export function getLanguageFromExtension(ext: string): string | null {
    return LANGUAGE_MAP[ext.toLowerCase()] || null;
}
