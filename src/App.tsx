import { Desktop } from "./desktop/Desktop";
import { WindowManagerProvider } from "./desktop/WindowManagerContext";
import { LanguageProvider } from "./context/LanguageContext";
import { PrintableResume } from "./windows/Resume/PrintableResume";

function App() {
  return (
    <LanguageProvider>
      <WindowManagerProvider>
        <Desktop />
        <PrintableResume />
      </WindowManagerProvider>
    </LanguageProvider>
  );
}

export default App;
