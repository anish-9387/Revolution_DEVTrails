import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import { KuberaProvider } from "./context/KuberaContext";
import ClaimsPage from "./pages/ClaimsPage";
import DisruptionPage from "./pages/DisruptionPage";
import OverviewPage from "./pages/OverviewPage";
import WorkerPage from "./pages/WorkerPage";

export default function App() {
  return (
    <KuberaProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/worker" element={<WorkerPage />} />
          <Route path="/disruption" element={<DisruptionPage />} />
          <Route path="/claims" element={<ClaimsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </KuberaProvider>
  );
}
