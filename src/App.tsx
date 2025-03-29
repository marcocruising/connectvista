import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Individuals from "./pages/Individuals";
import Companies from "./pages/Companies";
import Conversations from "./pages/Conversations";
import Tags from "./pages/Tags";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { useCRMStore } from "./store/crmStore";
import CompanyDetail from './pages/CompanyDetail';
import IndividualDetail from './pages/IndividualDetail';
import ConversationDetail from './pages/ConversationDetail';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, initializeAuth } = useCRMStore();
  
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/individuals" element={<Individuals />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/companies/:id" element={<CompanyDetail />} />
            <Route path="/individuals/:id" element={<IndividualDetail />} />
            <Route path="/conversations/:id" element={<ConversationDetail />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
