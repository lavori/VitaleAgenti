import React, { useState, useEffect, useCallback } from "react";
import { Globe, Settings, LogOut, Lock, User as UserIcon, ArrowRight, Save, Eye, EyeOff, ArrowLeft, X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- API Mock (Per rendere l'app autonoma - SOSTITUITO PER IL CONTESTO WEB) ---
// NOTA BENE: In un'app nativa, si userebbe un plugin come @capacitor/preferences
const STORAGE_KEY = "vitale_admin_credentials";

let initialMockUser = {
  full_name: "Utente Base", 
  vitale_username: "", 
  vitale_password: "", 
};

const getInitialUser = () => {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (storedData) {
    try {
      return JSON.parse(storedData);
    } catch (e) {
      console.error("Errore nel parsing dei dati di storage", e);
      return initialMockUser;
    }
  }
  return initialMockUser;
};

const base44Mock = {
  auth: {
    me: async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); 
      return getInitialUser();
    },
    updateMe: async (updates) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const currentUser = getInitialUser();
      const updatedUser = { ...currentUser, ...updates };
      // In un'app nativa, qui useresti: await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(updatedUser) });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      initialMockUser = updatedUser; 
      return updatedUser;
    },
    logout: async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      // In un'app nativa, qui useresti: await Preferences.remove({ key: STORAGE_KEY });
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload(); 
    },
  },
};

// --- Funzione di Routing Mock ---
const createPageUrl = (pageName) => pageName; 

// L'URL di login target
const VITALE_LOGIN_URL = "https://www.vitalesurgelati.it/admin/login.php";

// ************************************************
// NUOVA FUNZIONE PER L'ACCESSO NATIVO
// ************************************************
const openVitaleAdminNative = (username, password) => {
    // 1. Logica di iniezione JS per il login automatico. 
    // Il codice JS cerca i campi 'user' e 'password' nel form di login.
    const loginScript = `
        var username = '${username}';
        var password = '${password}';
        var userField = document.querySelector('input[name="user"]');
        var passwordField = document.querySelector('input[name="password"]');
        var loginForm = document.querySelector('form[method="POST"]');

        if (userField && passwordField) {
            userField.value = username;
            passwordField.value = password;
            // Tenta di inviare il form se trovato
            if (loginForm) {
                loginForm.submit();
            }
        }
    `;

    // 2. Simulazione del Plugin InAppBrowser (Capacitor/Cordova)
    // In un ambiente nativo REALE, qui useresti:
    /*
    import { Browser } from '@capacitor/browser';
    Browser.open({ url: VITALE_LOGIN_URL, toolbarColor: '#DC2626' }).then(() => {
        // Iniettare lo script dopo un breve ritardo per il caricamento della pagina
        setTimeout(() => {
            // Esempio: InAppBrowser.executeScript({ code: loginScript });
            console.log("SIMULAZIONE: Script di login iniettato nel browser nativo.");
        }, 3000);
    });
    */

    // Per la simulazione web in anteprima, mostriamo un modale
    return loginScript; 
};
// ************************************************


// --- Componenti UI Simulati (Non modificati) ---
const SimulatedButton = React.forwardRef(({ onClick, className = "", children, disabled, variant, type = "button" }, ref) => {
    const baseClasses = "rounded-xl font-semibold transition-all duration-300 flex items-center justify-center";
    let styleClasses = "bg-gray-200 text-gray-800 hover:bg-gray-300";

    if (variant === "outline") {
        styleClasses = "border border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600";
    } else if (variant === "ghost") {
        styleClasses = "text-gray-600 hover:bg-gray-100";
    }

    if (className.includes('bg-gradient-to-r') || className.includes('bg-red-600')) {
        styleClasses = className;
    }
    
    if (disabled) {
        styleClasses += " opacity-50 cursor-not-allowed";
    }

    return (
      <button 
        ref={ref}
        onClick={onClick} 
        className={`${baseClasses} ${styleClasses} ${className}`}
        disabled={disabled}
        type={type}
        style={{ padding: '0.75rem 1rem', minHeight: '3rem' }}
      >
        {children}
      </button>
    );
});

const SimulatedCard = ({ children, className }) => (
    <div className={`bg-white rounded-2xl shadow-xl ${className}`}>
        {children}
    </div>
);

const SimulatedCardContent = ({ children, className }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);

const SimulatedCardHeader = ({ children, className }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);

const SimulatedCardTitle = ({ children, className }) => (
    <h3 className={`text-xl font-bold ${className}`}>{children}</h3>
);

const SimulatedCardDescription = ({ children, className }) => (
    <p className={`text-sm ${className}`}>{children}</p>
);

const SimulatedInput = ({ id, type, value, onChange, placeholder, className, required, innerRef }) => (
    <input
        ref={innerRef}
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-white rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow ${className}`}
        required={required}
    />
);

const SimulatedLabel = ({ htmlFor, className, children }) => (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className}`}>
        {children}
    </label>
);

const SimulatedAlert = ({ children, variant, className }) => {
    let baseStyle = "p-4 rounded-lg border flex items-center";
    let colorStyle = "bg-red-50 border-red-200 text-red-700"; // Default to destructive

    if (variant === "destructive") {
        colorStyle = "bg-red-50 border-red-200 text-red-700";
    } else if (variant === "success") {
        colorStyle = "bg-green-50 border-green-200 text-green-700";
    }

    return <div className={`${baseStyle} ${colorStyle} ${className}`}>{children}</div>;
};

const SimulatedAlertDescription = ({ children }) => <p className="text-sm">{children}</p>;

// --- Componente Modale per la Simulazione dell'Accesso (Aggiornato per Native) ---
const AccessSimulationModal = ({ user, onClose, script }) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.8, y: -50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: -50 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6"
            >
                <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xl font-bold text-red-600 flex items-center">
                        <CheckCircle className="w-6 h-6 mr-2 text-green-500" /> 
                        Simulazione Accesso Nativo (Iniezione JS)
                    </h4>
                    <SimulatedButton variant="ghost" onClick={onClose} className="p-2 h-auto w-auto">
                        <X className="w-5 h-5" />
                    </SimulatedButton>
                </div>

                <div className="text-gray-700 mb-4 border-b pb-4">
                    <p className="mb-2 font-semibold">
                        In un'app mobile indipendente, la funzione `openVitaleAdminNative` 
                        aprirebbe un **browser interno** (`InAppBrowser` o `WebView`) e iniettarebbe il seguente script JS 
                        per eseguire il login automatico:
                    </p>
                </div>

                <p className="text-sm font-semibold mb-3 text-red-700">
                    Script JavaScript Iniettato:
                </p>
                
                <div className="space-y-3 bg-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="font-mono text-xs text-gray-800 whitespace-pre-wrap">
                        {script}
                    </pre>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                        **Destinazione:** Il browser interno si aprirebbe su: 
                        <span className="font-mono text-xs bg-blue-100 p-1 rounded break-all ml-1">{VITALE_LOGIN_URL}</span>
                    </p>
                </div>

                <SimulatedButton 
                    onClick={onClose} 
                    className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white"
                >
                    Chiudi Simulazione
                </SimulatedButton>
            </motion.div>
        </motion.div>
    );
};


// --- 1. Pagina Home ---
const HomePage = ({ user, loading, navigateTo }) => {
    const [showModal, setShowModal] = useState(false);
    const [loginScript, setLoginScript] = useState("");

    // FUNZIONE CHIAVE AGGIORNATA PER LA LOGICA NATIVA
    const openVitaleAdmin = useCallback(() => {
        if (user?.vitale_username && user?.vitale_password) {
            
            // 1. Esegue la logica di iniezione (restituisce lo script JS)
            const script = openVitaleAdminNative(user.vitale_username, user.vitale_password);
            
            // 2. In un ambiente web, mostriamo la simulazione
            setLoginScript(script);
            setShowModal(true);

        } else {
            console.warn("Credenziali mancanti. Reindirizzamento alla pagina di Setup.");
            navigateTo(createPageUrl("Setup"));
        }
    }, [user, navigateTo]);

    const handleLogout = async () => {
        console.log("Logout in corso...");
        await base44Mock.auth.logout();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    {/* Logo placeholder */}
                    <img 
                        src="https://placehold.co/300x150/f0f9ff/0f172a?text=Vitale+Group"
                        alt="Vitale Group Placeholder"
                        className="w-64 md:w-96 mx-auto mb-4 vitale-logo"
                    />
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <p className="mt-4 text-gray-600">Caricamento dati utente...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-2xl"
            >
                {/* Logo Header */}
                <div className="text-center mb-8">
                    <motion.img 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68f50f15e02877d380e55a5d/cc3a6f793_vitale_tr-1024x572.png"
                        alt="Vitale Group"
                        className="w-64 md:w-96 mx-auto mb-6 vitale-logo"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/300x150/f0f9ff/0f172a?text=Vitale+Group';
                        }}
                    />
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            Benvenuto, {user?.full_name}
                        </h1>
                        <p className="text-gray-600">Accesso rapido al pannello amministrativo</p>
                    </motion.div>
                </div>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <SimulatedCard className="overflow-hidden shadow-2xl border-none">
                        <SimulatedCardContent className="p-8">
                            {/* Credentials Info */}
                            <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-xl p-6 mb-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                                        <Lock className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-3">Credenziali Salvate</h3>
                                        <div className="space-y-2">
                                            <div className="bg-white rounded-lg p-3 flex items-center gap-2 shadow-sm">
                                                <UserIcon className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-gray-600">Username:</span>
                                                <span className="font-mono font-medium text-gray-900 truncate">{user?.vitale_username || 'Non configurato'}</span>
                                            </div>
                                            
                                            <div className="bg-white rounded-lg p-3 flex items-center gap-2 shadow-sm">
                                                <Lock className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-gray-600">Password:</span>
                                                <span className="font-mono font-medium text-gray-900">{user?.vitale_password ? '••••••••' : 'Non configurato'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <SimulatedButton 
                                    onClick={openVitaleAdmin}
                                    className="w-full h-14 text-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] text-white"
                                    disabled={!user?.vitale_username || !user?.vitale_password}
                                >
                                    <Globe className="w-5 h-5 mr-2" />
                                    Accedi a Vitale Admin (Nativo) <ArrowRight className="w-5 h-5 ml-2" />
                                </SimulatedButton>

                                <div className="grid grid-cols-2 gap-3">
                                    <SimulatedButton
                                        variant="outline"
                                        onClick={() => navigateTo(createPageUrl("Setup"))}
                                        className="h-12 border-2 hover:border-blue-600 hover:text-blue-600 transition-colors"
                                    >
                                        <Settings className="w-4 h-4 mr-2" />
                                        Modifica Credenziali
                                    </SimulatedButton>
                                    
                                    <SimulatedButton
                                        variant="outline"
                                        onClick={handleLogout}
                                        className="h-12 border-2 hover:border-gray-600 hover:text-gray-600 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Esci
                                    </SimulatedButton>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-800">
                                    <span className="font-semibold">Nota sulla versione Nativa:</span> In un'app mobile, 
                                    cliccando su "Accedi" si aprirebbe un browser interno (WebView) e le credenziali verrebbero 
                                    **iniettate automaticamente** nel form di login.
                                </p>
                            </div>
                        </SimulatedCardContent>
                    </SimulatedCard>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center mt-8 text-gray-500 text-sm"
                >
                    Vitale Group Admin Access • {new Date().getFullYear()}
                </motion.div>
            </motion.div>

            <AnimatePresence>
                {showModal && <AccessSimulationModal user={user} onClose={() => setShowModal(false)} script={loginScript} />}
            </AnimatePresence>
        </div>
    );
};


// --- 2. Pagina Setup (Non modificata) ---
const SetupPage = ({ user, loading, navigateTo }) => {
    const [username, setUsername] = useState(user?.vitale_username || "");
    const [password, setPassword] = useState(user?.vitale_password || "");
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (user) {
            setUsername(user.vitale_username || "");
            setPassword(user.vitale_password || "");
        }
    }, [user]);

    const handleSave = async (e) => {
        e.preventDefault();
        setError("");
        setSaveSuccess(false);

        if (!username || !password) {
            setError("Per favore, inserisci sia username che password");
            return;
        }

        setSaving(true);
        try {
            // Qui avviene il salvataggio nel localStorage tramite il mock API
            const updatedUser = await base44Mock.auth.updateMe({
                full_name: user?.full_name, // Mantieni il nome completo
                vitale_username: username,
                vitale_password: password
            });
            
            setSaveSuccess(true);
            
            // Reindirizza alla home dopo un breve successo
            setTimeout(() => {
                navigateTo(createPageUrl("Home"));
            }, 1000);

        } catch (saveError) {
            setError("Errore nel salvataggio. Riprova.");
            console.error("Errore:", saveError);
        } finally {
            setSaving(false);
        }
    };

    const hasExistingCredentials = user?.vitale_username && user?.vitale_password;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <motion.img 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68f50f15e02877d380e55a5d/cc3a6f793_vitale_tr-1024x572.png"
                        alt="Vitale Group"
                        className="w-48 md:w-64 mx-auto mb-4 vitale-logo"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/300x150/f0f9ff/0f172a?text=Vitale+Group';
                        }}
                    />
                </div>

                {/* Back Button */}
                {(hasExistingCredentials || saveSuccess) && (
                    <SimulatedButton
                        variant="ghost"
                        onClick={() => navigateTo(createPageUrl("Home"))}
                        className="mb-4 text-gray-700 hover:text-blue-600"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Torna alla Home
                    </SimulatedButton>
                )}

                {/* Setup Card */}
                <SimulatedCard className="shadow-2xl border-none">
                    <SimulatedCardHeader className="bg-gradient-to-r from-blue-600 to-red-600 text-white rounded-t-xl p-6">
                        <SimulatedCardTitle className="text-2xl text-white">
                            {hasExistingCredentials ? "Modifica Credenziali" : "Configurazione Iniziale"}
                        </SimulatedCardTitle>
                        <SimulatedCardDescription className="text-blue-200">
                            Inserisci le tue credenziali per il pannello admin Vitale Surgelati
                        </SimulatedCardDescription>
                    </SimulatedCardHeader>

                    <SimulatedCardContent className="p-6">
                        <form onSubmit={handleSave} className="space-y-5">
                            {error && (
                                <SimulatedAlert variant="destructive" className="bg-red-100 border-red-300">
                                    <SimulatedAlertDescription>{error}</SimulatedAlertDescription>
                                </SimulatedAlert>
                            )}

                            {saveSuccess && (
                                <SimulatedAlert variant="success" className="bg-green-100 border-green-300 text-green-700">
                                    <SimulatedAlertDescription>Credenziali salvate con successo!</SimulatedAlertDescription>
                                </SimulatedAlert>
                            )}

                            <div className="space-y-2">
                                <SimulatedLabel htmlFor="username">
                                    Username
                                </SimulatedLabel>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <SimulatedInput
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Il tuo username"
                                        className="pl-10 h-12 border-2 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <SimulatedLabel htmlFor="password">
                                    Password
                                </SimulatedLabel>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <SimulatedInput
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="La tua password"
                                        className="pl-10 pr-10 h-12 border-2 focus:border-blue-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <SimulatedButton
                                    type="submit"
                                    disabled={saving}
                                    className="w-full h-12 text-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg text-white"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            Salvataggio...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5 mr-2" />
                                            {hasExistingCredentials ? "Aggiorna Credenziali" : "Salva e Continua"}
                                        </>
                                    )}
                                </SimulatedButton>
                            </div>
                        </form>

                        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-sm text-amber-800">
                                <span className="font-semibold">Importante:</span> Le tue credenziali sono memorizzate in modo sicuro 
                                nella memoria locale del tuo browser (localStorage) e utilizzate solo per facilitare l'accesso.
                            </p>
                        </div>
                    </SimulatedCardContent>
                </SimulatedCard>

                {/* Info Footer */}
                <div className="text-center mt-6 text-gray-500 text-sm">
                    <p>Accesso protetto e semplificato.</p>
                </div>
            </motion.div>
        </div>
    );
};


// --- 3. Layout Principale e Router (Non modificato) ---
function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
                body { font-family: 'Inter', sans-serif; }
                
                @media (max-width: 768px) {
                    .vitale-logo {
                        max-width: 200px;
                    }
                }
            `}</style>
            
            {children}
        </div>
    );
}

// --- 4. Componente Principale App con Router (Non modificato) ---
export default function App() {
    const [currentPage, setCurrentPage] = useState("Home");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigateTo = useCallback((pageName) => {
        setCurrentPage(pageName);
    }, []);

    const loadUserData = async () => {
        try {
            const currentUser = await base44Mock.auth.me();
            setUser(currentUser);
            
            // Logica di reindirizzamento: se credenziali mancanti, vai a Setup
            if (!currentUser.vitale_username || !currentUser.vitale_password) {
                setCurrentPage("Setup");
            } else {
                setCurrentPage("Home");
            }
        } catch (error) {
            console.error("Errore nel caricamento dei dati utente:", error);
            setCurrentPage("Setup"); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserData();
    }, []);

    const renderPage = () => {
        if (loading) {
            return <HomePage loading={true} user={user} navigateTo={navigateTo} />;
        }

        switch (currentPage) {
            case "Home":
                return <HomePage user={user} loading={false} navigateTo={navigateTo} />;
            case "Setup":
                return <SetupPage user={user} loading={false} navigateTo={navigateTo} />;
            default:
                return <HomePage user={user} loading={false} navigateTo={navigateTo} />;
        }
    };

    return (
        <Layout>
            {renderPage()}
        </Layout>
    );
}
