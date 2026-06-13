export interface Project {
  id: string;
  name: string;
  slug: string;
  isOwned: boolean;
}

export const MOCK_PROJECTS: Project[] = [
  { id: "1", name: "Auth Flow", slug: "auth-flow", isOwned: true },
  { id: "2", name: "API Gateway", slug: "api-gateway", isOwned: true },
  { id: "3", name: "Payment Service", slug: "payment-service", isOwned: true },
  { id: "4", name: "Data Pipeline", slug: "data-pipeline", isOwned: false },
  { id: "5", name: "Notification Worker", slug: "notification-worker", isOwned: false },
];
