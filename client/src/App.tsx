import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { MemberAuthProvider } from "./context/MemberAuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import BoardList from "./pages/BoardList";
import BoardNew from "./pages/BoardNew";
import BoardDetail from "./pages/BoardDetail";
import MemberLogin from "./pages/MemberLogin";
import MemberSignup from "./pages/MemberSignup";
import NotFound from "./pages/NotFound";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MemberAuthProvider>
          <Routes>
            {/* 관리자 로그인은 공통 Layout(네비/푸터) 없이 단독 렌더링 */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdminProducts />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/"
              element={
                <Layout>
                  <Home />
                </Layout>
              }
            />
            <Route
              path="/about"
              element={
                <Layout>
                  <About />
                </Layout>
              }
            />
            <Route
              path="/products"
              element={
                <Layout>
                  <Products />
                </Layout>
              }
            />
            <Route
              path="/products/:id"
              element={
                <Layout>
                  <ProductDetail />
                </Layout>
              }
            />
            {/* 게시판: /board 는 자유 게시판으로, /board/new 는 자유 게시판 글쓰기로 리다이렉트 */}
            <Route path="/board" element={<Navigate to="/board/free" replace />} />
            <Route path="/board/new" element={<Navigate to="/board/free/new" replace />} />

            <Route
              path="/board/free"
              element={
                <Layout>
                  <BoardList boardType="FREE" />
                </Layout>
              }
            />
            <Route
              path="/board/members"
              element={
                <Layout>
                  <BoardList boardType="MEMBER" />
                </Layout>
              }
            />
            <Route
              path="/board/free/new"
              element={
                <Layout>
                  <BoardNew boardType="FREE" />
                </Layout>
              }
            />
            <Route
              path="/board/members/new"
              element={
                <Layout>
                  <BoardNew boardType="MEMBER" />
                </Layout>
              }
            />
            {/* 게시글 상세는 자유/회원 게시판 공용 (게시글 id는 전체 게시판에서 고유) */}
            <Route
              path="/board/:id"
              element={
                <Layout>
                  <BoardDetail />
                </Layout>
              }
            />

            <Route
              path="/login"
              element={
                <Layout>
                  <MemberLogin />
                </Layout>
              }
            />
            <Route
              path="/signup"
              element={
                <Layout>
                  <MemberSignup />
                </Layout>
              }
            />

            <Route
              path="*"
              element={
                <Layout>
                  <NotFound />
                </Layout>
              }
            />
          </Routes>
        </MemberAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
