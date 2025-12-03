import type { Plant } from "../../domain/model/plants.entity.ts";

interface BackendPlant {
  id: any;
  userId: any;
  name?: string;
  type?: string;
  imgUrl?: string;
  bio?: string;
  location?: string;
  status?: string;
  lastWatered?: string;
  nextWatering?: string;
  metrics?: any[];
  wateringLogs?: any[];
  createdAt: string;
  updatedAt: string;
}

export class PlantAssembler {
  static toDomain(raw: BackendPlant): Plant {
    return {
      id: Number(raw.id),
      userId: String(raw.userId),
      name: raw.name ?? '',
      type: raw.type ?? '',
      imgUrl: raw.imgUrl ?? '',
      bio: raw.bio ?? '',
      location: raw.location ?? '',
      status: this.normalizeStatus(raw.status),
      lastWatered: raw.lastWatered ?? '',
      nextWatering: raw.nextWatering ?? '',
      metrics: raw.metrics ?? [],
      wateringLogs: raw.wateringLogs ?? [],
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    };
  }

  static toBackend(plant: Plant): BackendPlant {
    return { ...plant, status: (plant.status || 'healthy').toUpperCase() };
  }

  private static normalizeStatus(s?: string): Plant['status'] {
    const status = s?.toLowerCase();
    if (status === 'warning' || status === 'critical') return status;
    return 'healthy';
  }
}
