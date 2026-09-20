"use client";

import { useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { HelpCircle, Loader2 } from "lucide-react";
import UsersManager from "@/components/admin/UsersManager";
import Toast from "@/components/admin/Toast";
import CategoryModal from "@/components/admin/CategoryModal";
import QuestionModal from "@/components/admin/QuestionModal";
import HelpModal from "@/components/admin/HelpModal";
import AdminSidebar from "@/components/admin/AdminSidebar";
import DashboardTab from "@/components/admin/DashboardTab";
import QuestionsTab from "@/components/admin/QuestionsTab";
import CategoriesTab from "@/components/admin/CategoriesTab";
import GroupsTab from "@/components/admin/GroupsTab";
import GroupModal from "@/components/admin/GroupModal";
import StatsTab from "@/components/admin/StatsTab";
import SupportTab from "@/components/admin/SupportTab";
import { useAdminStore, VALID_ADMIN_TABS } from "@/stores/useAdminStore";
import type { AdminTab } from "@/types/admin";

export default function AdminPage() {
  const {
    tab,
    setTab,
    loading,
    busy,
    toast,
    closeToast,
    groupModal,
    setGroupModal,
    saveGroup,
    catModal,
    setCatModal,
    saveCategory,
    categories,
    groups,
    questions,
    qModal,
    setQModal,
    saveQuestion,
    filterCategory,
    helpOpen,
    setHelpOpen,
    loadAllData,
  } = useAdminStore();

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab") as AdminTab | null;
      if (urlTab && VALID_ADMIN_TABS.includes(urlTab)) {
        setTab(urlTab);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-1">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <>
      <Toast msg={toast.msg} type={toast.type} onClose={closeToast} />

      <AnimatePresence>
        {groupModal !== null && (
          <GroupModal
            group={groupModal.id ? groupModal : null}
            onSave={saveGroup}
            onClose={() => setGroupModal(null)}
            busy={busy}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {catModal !== null && (
          <CategoryModal
            category={catModal.id ? catModal : null}
            categories={categories}
            groups={groups}
            onSave={saveCategory}
            onClose={() => setCatModal(null)}
            busy={busy}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {qModal !== null && (
          <QuestionModal
            question={qModal.id ? qModal : null}
            categories={categories}
            questions={questions}
            onSave={saveQuestion}
            onClose={() => setQModal(null)}
            busy={busy}
            defaultCategoryId={qModal.category_id || filterCategory || ""}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
      </AnimatePresence>

      <div className="flex flex-1 min-h-[calc(100vh-32px)]">
        <AdminSidebar />

        {/* Main Content Area */}
        <main className="flex-1 bg-[#f0f0f1] p-3 sm:p-6 text-[#2c3338] overflow-auto">
          {/* WordPress Page Header Tools */}
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-normal text-[#1d2327]">
                {tab === "dashboard" && "لوحة التحكم الرئيسة"}
                {tab === "groups" && "التصنيفات"}
                {tab === "categories" && "فئات الأسئلة"}
                {tab === "questions" && "الأسئلة"}
                {tab === "support" && "رسائل الدعم"}
                {tab === "users" && "المستخدمين"}
                {tab === "stats" && "إحصائيات اللعبة"}
              </h1>

              {tab === "questions" && (
                <button
                  type="button"
                  onClick={() =>
                    setQModal({ category_id: filterCategory || "" })
                  }
                  disabled={categories.length === 0}
                  className="bg-[#f6f7f7] border border-[#2271b1] hover:bg-[#2271b1] hover:text-white text-[#2271b1] text-xs font-semibold px-2.5 py-1 rounded transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  أضف جديداً
                </button>
              )}
              {tab === "categories" && (
                <button
                  type="button"
                  onClick={() => setCatModal({})}
                  className="bg-[#f6f7f7] border border-[#2271b1] hover:bg-[#2271b1] hover:text-white text-[#2271b1] text-xs font-semibold px-2.5 py-1 rounded transition shadow-sm cursor-pointer"
                >
                  أضف جديداً
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                className="text-[12px] bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-600 shadow-sm hover:bg-slate-50 cursor-pointer flex items-center gap-1 select-none outline-none focus:ring-2 focus:ring-cyan-500/20"
              >
                <HelpCircle className="w-3.5 h-3.5" /> المساعدة
              </button>
            </div>
          </div>

          {tab === "dashboard" && <DashboardTab />}
          {tab === "questions" && <QuestionsTab />}
          {tab === "groups" && <GroupsTab />}
          {tab === "categories" && <CategoriesTab />}
          {tab === "support" && <SupportTab />}
          {tab === "users" && <UsersManager />}
          {tab === "stats" && <StatsTab />}
        </main>
      </div>
    </>
  );
}
