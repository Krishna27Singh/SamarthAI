import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase";

export const EMERGENCY_SOURCES = ["manual_logs", "video_reports", "voice_reports", "scene_assessments"] as const;

export type EmergencySourceCollection = (typeof EMERGENCY_SOURCES)[number];

export type FetchAllEmergenciesFilters = {
  status?: string;
  filterField?: string;
  filterOperator?: "==" | "array-contains";
  filterValue?: unknown;
};

export type UnifiedEmergencyRecord = {
  id: string;
  sourceCollection: EmergencySourceCollection;
  data: Record<string, unknown>;
};

export async function fetchAllEmergencies(
  filters: FetchAllEmergenciesFilters = {},
): Promise<UnifiedEmergencyRecord[]> {
  const { status, filterField, filterOperator = "==", filterValue } = filters;

  const sourceResults = await Promise.all(
    EMERGENCY_SOURCES.map(async (sourceCollection) => {
      const queryConstraints = [];

      if (status) {
        queryConstraints.push(where("status", "==", status));
      }

      if (filterField) {
        queryConstraints.push(where(filterField, filterOperator, filterValue));
      }

      const snapshot = await getDocs(query(collection(db, sourceCollection), ...queryConstraints));

      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        sourceCollection,
        data: docSnap.data() as Record<string, unknown>,
      }));
    }),
  );

  return sourceResults.flat();
}