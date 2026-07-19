import { Desktop } from "./desktop/Desktop";
import { LanguageProvider } from "./context/LanguageContext";
import { PrintableResume } from "./windows/Resume/PrintableResume";

function App() {
  return (
    <LanguageProvider>
      <Desktop />
      <PrintableResume />
    </LanguageProvider>
  );
}

export default App;
