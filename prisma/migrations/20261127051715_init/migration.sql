-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BARANGAY_SECRETARY', 'MUNICIPAL_PERSONNEL', 'MUNICIPAL_ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "Classification" AS ENUM ('URBAN', 'RURAL');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "CivilStatus" AS ENUM ('SINGLE', 'MARRIED', 'WIDOWED', 'SEPARATED', 'ANNULLED', 'LIVE_IN');

-- CreateEnum
CREATE TYPE "ResidentStatus" AS ENUM ('ACTIVE', 'MOVED_OUT', 'DECEASED');

-- CreateEnum
CREATE TYPE "Relationship" AS ENUM ('HEAD', 'SPOUSE', 'SON', 'DAUGHTER', 'FATHER', 'MOTHER', 'SIBLING', 'GRANDCHILD', 'GRANDPARENT', 'IN_LAW', 'RELATIVE', 'BOARDER', 'HELPER', 'OTHER');

-- CreateEnum
CREATE TYPE "Education" AS ENUM ('NONE', 'ELEMENTARY_LEVEL', 'ELEMENTARY_GRADUATE', 'HIGH_SCHOOL_LEVEL', 'HIGH_SCHOOL_GRADUATE', 'SENIOR_HIGH', 'VOCATIONAL', 'COLLEGE_LEVEL', 'COLLEGE_GRADUATE', 'POST_GRADUATE');

-- CreateEnum
CREATE TYPE "TenureStatus" AS ENUM ('OWNED', 'RENTED', 'SHARED', 'INFORMAL', 'OTHER');

-- CreateEnum
CREATE TYPE "WaterSource" AS ENUM ('LEVEL_I', 'LEVEL_II', 'LEVEL_III', 'DELIVERED', 'OTHER');

-- CreateEnum
CREATE TYPE "ToiletType" AS ENUM ('WATER_SEALED', 'POUR_FLUSH', 'PIT_LATRINE', 'SHARED', 'NONE');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('CERTIFICATE', 'OTHER');

-- CreateEnum
CREATE TYPE "RequestChannel" AS ENUM ('WALK_IN', 'ONLINE');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY_FOR_RELEASE', 'RELEASED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "IssuedStatus" AS ENUM ('VALID', 'VOIDED');

-- CreateEnum
CREATE TYPE "BlotterKind" AS ENUM ('INCIDENT', 'COMPLAINT');

-- CreateEnum
CREATE TYPE "BlotterStatus" AS ENUM ('OPEN', 'UNDER_MEDIATION', 'UNDER_CONCILIATION', 'UNDER_ARBITRATION', 'SETTLED', 'REFERRED', 'CERTIFIED_TO_FILE_ACTION', 'DISMISSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "KpStage" AS ENUM ('MEDIATION', 'CONCILIATION', 'ARBITRATION');

-- CreateEnum
CREATE TYPE "PartyRole" AS ENUM ('COMPLAINANT', 'RESPONDENT', 'VICTIM', 'WITNESS');

-- CreateEnum
CREATE TYPE "HearingOutcome" AS ENUM ('SCHEDULED', 'HELD', 'RESCHEDULED', 'NO_SHOW', 'SETTLED', 'FAILED');

-- CreateEnum
CREATE TYPE "Species" AS ENUM ('DOG', 'CAT', 'CARABAO', 'CATTLE', 'GOAT', 'PIG', 'HORSE', 'POULTRY', 'OTHER');

-- CreateEnum
CREATE TYPE "AnimalStatus" AS ENUM ('ACTIVE', 'DECEASED', 'TRANSFERRED', 'MISSING');

-- CreateEnum
CREATE TYPE "ResourceCategory" AS ENUM ('FACILITY', 'EQUIPMENT', 'VEHICLE', 'WATER_SYSTEM', 'EVACUATION_CENTER', 'HEALTH', 'LAND', 'OTHER');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('GOOD', 'FAIR', 'POOR', 'UNSERVICEABLE');

-- CreateEnum
CREATE TYPE "ReportKind" AS ENUM ('DEMOGRAPHICS', 'HOUSEHOLDS', 'CERTIFICATES', 'BLOTTER', 'COMMUNITY_RESOURCES', 'BARANGAY_PROFILE', 'OTHER');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'SEMESTRAL', 'ANNUAL', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'RETURNED');

-- CreateEnum
CREATE TYPE "AnnouncementScope" AS ENUM ('SYSTEM', 'MUNICIPAL', 'BARANGAY');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('URGENT', 'HIGH', 'NORMAL');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'ISSUE', 'VOID', 'SUBMIT', 'REVIEW', 'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_CHANGE', 'PASSWORD_RESET', 'EXPORT');

-- CreateTable
CREATE TABLE "Region" (
    "code" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Province" (
    "code" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "regionCode" VARCHAR(10) NOT NULL,

    CONSTRAINT "Province_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Municipality" (
    "code" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "isCity" BOOLEAN NOT NULL DEFAULT false,
    "regionCode" VARCHAR(10) NOT NULL,
    "provinceCode" VARCHAR(10),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "address" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Municipality_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Barangay" (
    "code" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "municipalityCode" VARCHAR(10) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "classification" "Classification" NOT NULL DEFAULT 'RURAL',
    "landAreaHectares" DECIMAL(10,2),
    "dateEstablished" DATE,
    "zipCode" VARCHAR(8),
    "legislativeDistrict" TEXT,
    "history" TEXT,
    "vision" TEXT,
    "mission" TEXT,
    "boundaryNorth" TEXT,
    "boundaryEast" TEXT,
    "boundarySouth" TEXT,
    "boundaryWest" TEXT,
    "address" TEXT,
    "landline" TEXT,
    "mobile" TEXT,
    "email" TEXT,
    "facebook" TEXT,
    "officeHours" JSONB,
    "hotlines" JSONB,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Barangay_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Purok" (
    "id" TEXT NOT NULL,
    "barangayCode" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Purok_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarangayOfficial" (
    "id" TEXT NOT NULL,
    "barangayCode" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "committee" TEXT,
    "termStart" DATE,
    "termEnd" DATE,
    "contact" TEXT,
    "email" TEXT,
    "photoUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSignatory" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BarangayOfficial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarangayBody" (
    "id" TEXT NOT NULL,
    "barangayCode" VARCHAR(10) NOT NULL,
    "acronym" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "head" TEXT,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BarangayBody_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MunicipalOffice" (
    "id" TEXT NOT NULL,
    "municipalityCode" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MunicipalOffice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "suffix" TEXT,
    "position" TEXT,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "barangayCode" VARCHAR(10),
    "municipalityCode" VARCHAR(10),
    "officeId" TEXT,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferences" JSONB,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "failedLogins" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Counter" (
    "barangayCode" VARCHAR(10) NOT NULL,
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("barangayCode","key")
);

-- CreateTable
CREATE TABLE "Household" (
    "id" TEXT NOT NULL,
    "barangayCode" VARCHAR(10) NOT NULL,
    "householdNo" TEXT NOT NULL,
    "purokId" TEXT,
    "address" TEXT NOT NULL,
    "tenure" "TenureStatus" NOT NULL DEFAULT 'OWNED',
    "waterSource" "WaterSource" NOT NULL DEFAULT 'LEVEL_III',
    "toilet" "ToiletType" NOT NULL DEFAULT 'WATER_SEALED',
    "hasElectricity" BOOLEAN NOT NULL DEFAULT true,
    "monthlyIncome" DECIMAL(12,2),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL,
    "barangayCode" VARCHAR(10) NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resident" (
    "id" TEXT NOT NULL,
    "barangayCode" VARCHAR(10) NOT NULL,
    "residentNo" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "suffix" TEXT,
    "sex" "Sex" NOT NULL,
    "birthDate" DATE NOT NULL,
    "birthPlace" TEXT,
    "civilStatus" "CivilStatus" NOT NULL DEFAULT 'SINGLE',
    "citizenship" TEXT NOT NULL DEFAULT 'Filipino',
    "religion" TEXT,
    "occupation" TEXT,
    "education" "Education",
    "contactNumber" TEXT,
    "email" TEXT,
    "philsysNo" TEXT,
    "purokId" TEXT,
    "address" TEXT NOT NULL,
    "residentSince" INTEGER,
    "householdId" TEXT,
    "familyId" TEXT,
    "relationship" "Relationship",
    "isRegisteredVoter" BOOLEAN NOT NULL DEFAULT false,
    "voterPrecinct" TEXT,
    "isPwd" BOOLEAN NOT NULL DEFAULT false,
    "disability" TEXT,
    "isSoloParent" BOOLEAN NOT NULL DEFAULT false,
    "is4Ps" BOOLEAN NOT NULL DEFAULT false,
    "isIndigenous" BOOLEAN NOT NULL DEFAULT false,
    "isOfw" BOOLEAN NOT NULL DEFAULT false,
    "isOutOfSchoolYouth" BOOLEAN NOT NULL DEFAULT false,
    "seniorIdNo" TEXT,
    "status" "ResidentStatus" NOT NULL DEFAULT 'ACTIVE',
    "remarks" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Resident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentType" (
    "id" TEXT NOT NULL,
    "barangayCode" VARCHAR(10) NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL DEFAULT 'CERTIFICATE',
    "description" TEXT NOT NULL,
    "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "validityMonths" INTEGER,
    "prefix" VARCHAR(6) NOT NULL,
    "bodyTemplate" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentRequest" (
    "id" TEXT NOT NULL,
    "barangayCode" VARCHAR(10) NOT NULL,
    "requestNo" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "documentTypeId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "channel" "RequestChannel" NOT NULL DEFAULT 'WALK_IN',
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "rejectionReason" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedById" TEXT,
    "releasedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssuedDocument" (
    "id" TEXT NOT NULL,
    "barangayCode" VARCHAR(10) NOT NULL,
    "controlNo" TEXT NOT NULL,
    "documentTypeId" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "requestId" TEXT,
    "purpose" TEXT NOT NULL,
    "fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "orNumber" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "snapshot" JSONB NOT NULL,
    "signatoryName" TEXT NOT NULL,
    "signatoryPosition" TEXT NOT NULL,
    "issuedById" TEXT NOT NULL,
    "status" "IssuedStatus" NOT NULL DEFAULT 'VALID',
    "voidReason" TEXT,
    "voidedAt" TIMESTAMP(3),
    "voidedById" TEXT,
    "printCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "IssuedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlotterEntry" (
    "id" TEXT NOT NULL,
    "barangayCode" VARCHAR(10) NOT NULL,
    "blotterNo" TEXT NOT NULL,
    "kind" "BlotterKind" NOT NULL DEFAULT 'INCIDENT',
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "narrative" TEXT NOT NULL,
    "incidentAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "purokId" TEXT,
    "status" "BlotterStatus" NOT NULL DEFAULT 'OPEN',
    "actionTaken" TEXT,
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "kpStage" "KpStage",
    "kpCaseNo" TEXT,
    "kpFiledAt" TIMESTAMP(3),
    "kpDeadline" TIMESTAMP(3),
    "isVawc" BOOLEAN NOT NULL DEFAULT false,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BlotterEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlotterParty" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "role" "PartyRole" NOT NULL,
    "residentId" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "contact" TEXT,
    "age" INTEGER,
    "sex" "Sex",
    "statement" TEXT,

    CONSTRAINT "BlotterParty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseHearing" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "stage" "KpStage" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "outcome" "HearingOutcome" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseHearing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Animal" (
    "id" TEXT NOT NULL,
    "barangayCode" VARCHAR(10) NOT NULL,
    "tagNo" TEXT NOT NULL,
    "species" "Species" NOT NULL,
    "name" TEXT,
    "breed" TEXT,
    "sex" "Sex",
    "color" TEXT,
    "birthYear" INTEGER,
    "ownerResidentId" TEXT,
    "ownerName" TEXT NOT NULL,
    "householdId" TEXT,
    "lastVaccinatedAt" DATE,
    "vaccine" TEXT,
    "status" "AnimalStatus" NOT NULL DEFAULT 'ACTIVE',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityResource" (
    "id" TEXT NOT NULL,
    "barangayCode" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ResourceCategory" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'unit',
    "condition" "Condition" NOT NULL DEFAULT 'GOOD',
    "location" TEXT,
    "custodian" TEXT,
    "acquiredAt" DATE,
    "value" DECIMAL(14,2),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CommunityResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportRequirement" (
    "id" TEXT NOT NULL,
    "municipalityCode" VARCHAR(10) NOT NULL,
    "officeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "kind" "ReportKind" NOT NULL,
    "frequency" "Frequency" NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "barangayCode" VARCHAR(10) NOT NULL,
    "requirementId" TEXT,
    "officeId" TEXT NOT NULL,
    "kind" "ReportKind" NOT NULL,
    "title" TEXT NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "data" JSONB NOT NULL,
    "notes" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "version" INTEGER NOT NULL DEFAULT 1,
    "submittedAt" TIMESTAMP(3),
    "submittedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "scope" "AnnouncementScope" NOT NULL,
    "municipalityCode" VARCHAR(10),
    "barangayCode" VARCHAR(10),
    "officeId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "isAdvisory" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "status" "PublishStatus" NOT NULL DEFAULT 'PUBLISHED',
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnouncementRead" (
    "announcementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnouncementRead_pkey" PRIMARY KEY ("announcementId","userId")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "summary" TEXT NOT NULL,
    "changes" JSONB,
    "barangayCode" VARCHAR(10),
    "municipalityCode" VARCHAR(10),
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "Province_regionCode_idx" ON "Province"("regionCode");

-- CreateIndex
CREATE INDEX "Municipality_regionCode_idx" ON "Municipality"("regionCode");

-- CreateIndex
CREATE INDEX "Municipality_provinceCode_idx" ON "Municipality"("provinceCode");

-- CreateIndex
CREATE INDEX "Barangay_municipalityCode_idx" ON "Barangay"("municipalityCode");

-- CreateIndex
CREATE UNIQUE INDEX "Purok_barangayCode_name_key" ON "Purok"("barangayCode", "name");

-- CreateIndex
CREATE INDEX "BarangayOfficial_barangayCode_isActive_idx" ON "BarangayOfficial"("barangayCode", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "BarangayBody_barangayCode_acronym_key" ON "BarangayBody"("barangayCode", "acronym");

-- CreateIndex
CREATE UNIQUE INDEX "MunicipalOffice_municipalityCode_name_key" ON "MunicipalOffice"("municipalityCode", "name");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_municipalityCode_idx" ON "User"("role", "municipalityCode");

-- CreateIndex
CREATE INDEX "User_barangayCode_idx" ON "User"("barangayCode");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Household_barangayCode_deletedAt_idx" ON "Household"("barangayCode", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Household_barangayCode_householdNo_key" ON "Household"("barangayCode", "householdNo");

-- CreateIndex
CREATE INDEX "Family_householdId_idx" ON "Family"("householdId");

-- CreateIndex
CREATE INDEX "Resident_barangayCode_deletedAt_status_idx" ON "Resident"("barangayCode", "deletedAt", "status");

-- CreateIndex
CREATE INDEX "Resident_barangayCode_lastName_firstName_idx" ON "Resident"("barangayCode", "lastName", "firstName");

-- CreateIndex
CREATE INDEX "Resident_householdId_idx" ON "Resident"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "Resident_barangayCode_residentNo_key" ON "Resident"("barangayCode", "residentNo");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentType_barangayCode_key_key" ON "DocumentType"("barangayCode", "key");

-- CreateIndex
CREATE INDEX "DocumentRequest_barangayCode_status_idx" ON "DocumentRequest"("barangayCode", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentRequest_barangayCode_requestNo_key" ON "DocumentRequest"("barangayCode", "requestNo");

-- CreateIndex
CREATE UNIQUE INDEX "IssuedDocument_requestId_key" ON "IssuedDocument"("requestId");

-- CreateIndex
CREATE INDEX "IssuedDocument_barangayCode_issuedAt_idx" ON "IssuedDocument"("barangayCode", "issuedAt");

-- CreateIndex
CREATE INDEX "IssuedDocument_residentId_idx" ON "IssuedDocument"("residentId");

-- CreateIndex
CREATE UNIQUE INDEX "IssuedDocument_barangayCode_controlNo_key" ON "IssuedDocument"("barangayCode", "controlNo");

-- CreateIndex
CREATE INDEX "BlotterEntry_barangayCode_kind_status_idx" ON "BlotterEntry"("barangayCode", "kind", "status");

-- CreateIndex
CREATE INDEX "BlotterEntry_barangayCode_isVawc_idx" ON "BlotterEntry"("barangayCode", "isVawc");

-- CreateIndex
CREATE UNIQUE INDEX "BlotterEntry_barangayCode_blotterNo_key" ON "BlotterEntry"("barangayCode", "blotterNo");

-- CreateIndex
CREATE INDEX "BlotterParty_entryId_idx" ON "BlotterParty"("entryId");

-- CreateIndex
CREATE INDEX "CaseHearing_entryId_idx" ON "CaseHearing"("entryId");

-- CreateIndex
CREATE INDEX "Animal_barangayCode_species_idx" ON "Animal"("barangayCode", "species");

-- CreateIndex
CREATE UNIQUE INDEX "Animal_barangayCode_tagNo_key" ON "Animal"("barangayCode", "tagNo");

-- CreateIndex
CREATE INDEX "CommunityResource_barangayCode_category_idx" ON "CommunityResource"("barangayCode", "category");

-- CreateIndex
CREATE INDEX "ReportRequirement_municipalityCode_dueAt_idx" ON "ReportRequirement"("municipalityCode", "dueAt");

-- CreateIndex
CREATE INDEX "Submission_barangayCode_status_idx" ON "Submission"("barangayCode", "status");

-- CreateIndex
CREATE INDEX "Submission_requirementId_idx" ON "Submission"("requirementId");

-- CreateIndex
CREATE INDEX "Announcement_scope_municipalityCode_status_idx" ON "Announcement"("scope", "municipalityCode", "status");

-- CreateIndex
CREATE INDEX "Announcement_barangayCode_idx" ON "Announcement"("barangayCode");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "AuditLog_barangayCode_createdAt_idx" ON "AuditLog"("barangayCode", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_municipalityCode_createdAt_idx" ON "AuditLog"("municipalityCode", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "Province" ADD CONSTRAINT "Province_regionCode_fkey" FOREIGN KEY ("regionCode") REFERENCES "Region"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Municipality" ADD CONSTRAINT "Municipality_regionCode_fkey" FOREIGN KEY ("regionCode") REFERENCES "Region"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Municipality" ADD CONSTRAINT "Municipality_provinceCode_fkey" FOREIGN KEY ("provinceCode") REFERENCES "Province"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Barangay" ADD CONSTRAINT "Barangay_municipalityCode_fkey" FOREIGN KEY ("municipalityCode") REFERENCES "Municipality"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purok" ADD CONSTRAINT "Purok_barangayCode_fkey" FOREIGN KEY ("barangayCode") REFERENCES "Barangay"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarangayOfficial" ADD CONSTRAINT "BarangayOfficial_barangayCode_fkey" FOREIGN KEY ("barangayCode") REFERENCES "Barangay"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarangayBody" ADD CONSTRAINT "BarangayBody_barangayCode_fkey" FOREIGN KEY ("barangayCode") REFERENCES "Barangay"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MunicipalOffice" ADD CONSTRAINT "MunicipalOffice_municipalityCode_fkey" FOREIGN KEY ("municipalityCode") REFERENCES "Municipality"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_barangayCode_fkey" FOREIGN KEY ("barangayCode") REFERENCES "Barangay"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_municipalityCode_fkey" FOREIGN KEY ("municipalityCode") REFERENCES "Municipality"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "MunicipalOffice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Counter" ADD CONSTRAINT "Counter_barangayCode_fkey" FOREIGN KEY ("barangayCode") REFERENCES "Barangay"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Household" ADD CONSTRAINT "Household_barangayCode_fkey" FOREIGN KEY ("barangayCode") REFERENCES "Barangay"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Household" ADD CONSTRAINT "Household_purokId_fkey" FOREIGN KEY ("purokId") REFERENCES "Purok"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Family" ADD CONSTRAINT "Family_barangayCode_fkey" FOREIGN KEY ("barangayCode") REFERENCES "Barangay"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Family" ADD CONSTRAINT "Family_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resident" ADD CONSTRAINT "Resident_barangayCode_fkey" FOREIGN KEY ("barangayCode") REFERENCES "Barangay"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resident" ADD CONSTRAINT "Resident_purokId_fkey" FOREIGN KEY ("purokId") REFERENCES "Purok"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resident" ADD CONSTRAINT "Resident_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resident" ADD CONSTRAINT "Resident_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentType" ADD CONSTRAINT "DocumentType_barangayCode_fkey" FOREIGN KEY ("barangayCode") REFERENCES "Barangay"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRequest" ADD CONSTRAINT "DocumentRequest_barangayCode_fkey" FOREIGN KEY ("barangayCode") REFERENCES "Barangay"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRequest" ADD CONSTRAINT "DocumentRequest_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRequest" ADD CONSTRAINT "DocumentRequest_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssuedDocument" ADD CONSTRAINT "IssuedDocument_barangayCode_fkey" FOREIGN KEY ("barangayCode") REFERENCES "Barangay"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssuedDocument" ADD CONSTRAINT "IssuedDocument_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssuedDocument" ADD CONSTRAINT "IssuedDocument_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssuedDocument" ADD CONSTRAINT "IssuedDocument_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "DocumentRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlotterEntry" ADD CONSTRAINT "BlotterEntry_barangayCode_fkey" FOREIGN KEY ("barangayCode") REFERENCES "Barangay"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlotterEntry" ADD CONSTRAINT "BlotterEntry_purokId_fkey" FOREIGN KEY ("purokId") REFERENCES "Purok"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlotterParty" ADD CONSTRAINT "BlotterParty_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "BlotterEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlotterParty" ADD CONSTRAINT "BlotterParty_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseHearing" ADD CONSTRAINT "CaseHearing_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "BlotterEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_barangayCode_fkey" FOREIGN KEY ("barangayCode") REFERENCES "Barangay"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_ownerResidentId_fkey" FOREIGN KEY ("ownerResidentId") REFERENCES "Resident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityResource" ADD CONSTRAINT "CommunityResource_barangayCode_fkey" FOREIGN KEY ("barangayCode") REFERENCES "Barangay"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportRequirement" ADD CONSTRAINT "ReportRequirement_municipalityCode_fkey" FOREIGN KEY ("municipalityCode") REFERENCES "Municipality"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportRequirement" ADD CONSTRAINT "ReportRequirement_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "MunicipalOffice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_barangayCode_fkey" FOREIGN KEY ("barangayCode") REFERENCES "Barangay"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "ReportRequirement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "MunicipalOffice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_municipalityCode_fkey" FOREIGN KEY ("municipalityCode") REFERENCES "Municipality"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_barangayCode_fkey" FOREIGN KEY ("barangayCode") REFERENCES "Barangay"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "MunicipalOffice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementRead" ADD CONSTRAINT "AnnouncementRead_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementRead" ADD CONSTRAINT "AnnouncementRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
