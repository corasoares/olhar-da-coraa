import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import SuperAdmin from "./pages/SuperAdmin";
import Lessons from "./pages/Lessons";
import LessonPlayer from "./pages/LessonPlayer";
import LessonResults from "./pages/LessonResults";
import Quizzes from "./pages/Quizzes";
import Progress from "./pages/Progress";
import NotFound from "./pages/NotFound";
import LessonsManager from "./pages/admin/LessonsManager";
import LessonEditor from "./pages/admin/LessonEditor";
import TopicsManager from "./pages/admin/TopicsManager";
import UsersManager from "./pages/admin/UsersManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin"
              element={
                <ProtectedRoute requireSuperAdmin>
                  <SuperAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lessons"
              element={
                <ProtectedRoute>
                  <Lessons />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lesson/:id"
              element={
                <ProtectedRoute>
                  <LessonPlayer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lesson/:id/results"
              element={
                <ProtectedRoute>
                  <LessonResults />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes"
              element={
                <ProtectedRoute>
                  <Quizzes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <Progress />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/lessons" element={<ProtectedRoute requireSuperAdmin><LessonsManager /></ProtectedRoute>} />
            <Route path="/admin/lessons/new" element={<ProtectedRoute requireSuperAdmin><LessonEditor /></ProtectedRoute>} />
            <Route path="/admin/lessons/:id" element={<ProtectedRoute requireSuperAdmin><LessonEditor /></ProtectedRoute>} />
            <Route path="/admin/topics" element={<ProtectedRoute requireSuperAdmin><TopicsManager /></ProtectedRoute>} />
            <Route path="/super-admin/users" element={<ProtectedRoute requireSuperAdmin><UsersManager /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
