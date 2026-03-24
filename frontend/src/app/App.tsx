import { Outlet } from "react-router-dom";
import { ContentProvider } from "../context/ContentContext";
import { AppLayout } from "../layouts/AppLayout";

export function App() {
  return (
    <ContentProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </ContentProvider>
  );
}
