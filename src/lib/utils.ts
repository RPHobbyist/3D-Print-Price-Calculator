import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Removes the file extension from a filename.
 * Example: "my-model.gcode" -> "my-model"
 */
export function stripFileExtension(filename: string): string {
  if (!filename) return "";
  return filename.substring(0, filename.lastIndexOf('.')) || filename;
}

/**
 * Processes a description string to check for the [HIDDEN] tag.
 * Returns the cleaned description and the visibility status.
 */
export function processVisibilityFromDescription(description: string | null, isVisibleColumn?: boolean): { description: string, is_visible: boolean } {
  let isVisible = true;
  let cleanDescription = description || "";

  // Check for [HIDDEN] tag (with or without space)
  if (cleanDescription.startsWith('[HIDDEN]')) {
    isVisible = false;
    // Remove the tag and any following whitespace
    cleanDescription = cleanDescription.replace(/^\[HIDDEN\]\s*/, '');
  }

  // Fallback for legacy column if needed
  if (isVisibleColumn === false) {
    isVisible = false;
  }

  return { description: cleanDescription, is_visible: isVisible };
}

/**
 * Adds the [HIDDEN] tag to a description if isVisible is false.
 */
export function addVisibilityTag(description: string, isVisible: boolean): string {
  let finalDescription = description || "";

  // Remove existing tag if present to avoid duplication
  if (finalDescription.startsWith('[HIDDEN] ')) {
    finalDescription = finalDescription.replace('[HIDDEN] ', '');
  }

  if (!isVisible) {
    finalDescription = `[HIDDEN] ${finalDescription}`;
  }

  return finalDescription;
}
