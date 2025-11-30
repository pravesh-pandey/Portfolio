import { ReactLenis } from "@studio-freight/react-lenis";
import { AppLayout } from "@layout/AppLayout.jsx";
import { AppRoutes } from "./router.jsx";
import { Cursor } from "./components/common/Cursor.jsx";

const App = () => (
  <ReactLenis root>
    <Cursor />
    <AppLayout>
      <AppRoutes />
    </AppLayout>
  </ReactLenis>
);

export default App;
