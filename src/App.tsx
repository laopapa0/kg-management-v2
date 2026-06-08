import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { MotionProvider } from './components/motion/MotionProvider'
import { getStoredTheme, applyTheme } from './components/theme/ThemeSwitcher'
import Layout from './components/Layout'
import DashboardPage from './pages/dashboard/DashboardPage'
import IndicatorManagementPage from './pages/indicator-management/IndicatorManagementPage'
import LineageCanvasPage from './pages/lineage/LineageCanvasPage'
import KnowledgeUploadPage from './pages/knowledge-upload/KnowledgeUploadPage'
import ReportManagementPage from './pages/report-management/ReportManagementPage'

export default function App() {
  useEffect(() => {
    const theme = getStoredTheme()
    applyTheme(theme)
  }, [])

  return (
    <MotionProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/indicator-management" element={<IndicatorManagementPage />} />
          <Route path="/lineage" element={<LineageCanvasPage />} />
          <Route path="/reports" element={<ReportManagementPage />} />
          <Route path="/knowledge-upload" element={<KnowledgeUploadPage />} />

          {/* [LEGACY] /indicator/create */}
          {/* <Route path="/indicator/create" element={<IndicatorCreatePage />} /> */}
          {/* [LEGACY] /indicator/edit/:id */}
          {/* <Route path="/indicator/edit/:id" element={<IndicatorEditPage />} /> */}
          {/* [LEGACY] /tag-config */}
          {/* <Route path="/tag-config" element={<TagConfigPage />} /> */}
          {/* [LEGACY] /rule-config */}
          {/* <Route path="/rule-config" element={<RuleConfigPage />} /> */}
          {/* [LEGACY] /inspection-todo */}
          {/* <Route path="/inspection-todo" element={<InspectionTodoPage />} /> */}
          {/* [LEGACY] /noc/object-type */}
          {/* <Route path="/noc/object-type" element={<NocObjectTypePage />} /> */}
          {/* [LEGACY] /noc/link-relation */}
          {/* <Route path="/noc/link-relation" element={<NocLinkRelationPage />} /> */}
          {/* [LEGACY] /noc/property */}
          {/* <Route path="/noc/property" element={<NocPropertyPage />} /> */}
          {/* [LEGACY] /noc/tag */}
          {/* <Route path="/noc/tag" element={<NocTagPage />} /> */}
          {/* [LEGACY] /noc/rule */}
          {/* <Route path="/noc/rule" element={<NocRulePage />} /> */}
          {/* [LEGACY] /noc/audit */}
          {/* <Route path="/noc/audit" element={<NocAuditPage />} /> */}
          {/* [LEGACY] /noc/inspection */}
          {/* <Route path="/noc/inspection" element={<InspectionManagementPage />} /> */}
          {/* [LEGACY] /knowledge-management */}
          {/* <Route path="/knowledge-management" element={<KnowledgeManagementPage />} /> */}
          {/* [LEGACY] /platform/object-type */}
          {/* <Route path="/platform/object-type" element={<PlatformObjectTypePage />} /> */}
          {/* [LEGACY] /platform/link-type */}
          {/* <Route path="/platform/link-type" element={<PlatformLinkTypePage />} /> */}
          {/* [LEGACY] /platform/property */}
          {/* <Route path="/platform/property" element={<PlatformPropertyPage />} /> */}
          {/* [LEGACY] /platform/graph */}
          {/* <Route path="/platform/graph" element={<PlatformGraphPage />} /> */}
        </Routes>
      </Layout>
    </MotionProvider>
  )
}
