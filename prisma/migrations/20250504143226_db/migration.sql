/*
  Warnings:

  - You are about to drop the `CompletedCourse` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `completedCourses` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CompletedCourse";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "courseName" TEXT NOT NULL,
    "courseNumber" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "prerequisites" TEXT NOT NULL,
    "status" TEXT NOT NULL
);
INSERT INTO "new_Course" ("courseName", "courseNumber", "id", "major", "prerequisites", "status") SELECT "courseName", "courseNumber", "id", "major", "prerequisites", "status" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
CREATE TABLE "new_Student" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "majorName" TEXT NOT NULL,
    "advisor" TEXT NOT NULL,
    "cgpa" REAL NOT NULL,
    "completedCourses" TEXT NOT NULL,
    CONSTRAINT "Student_majorName_fkey" FOREIGN KEY ("majorName") REFERENCES "Major" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Student" ("advisor", "cgpa", "firstName", "id", "lastName", "majorName", "password", "role", "username") SELECT "advisor", "cgpa", "firstName", "id", "lastName", "majorName", "password", "role", "username" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE UNIQUE INDEX "Student_username_key" ON "Student"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
