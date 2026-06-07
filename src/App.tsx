import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './pages/dashboard/DashboardPage'
import IndicatorCreatePage from './pages/indicator-create/IndicatorCreatePage'
import IndicatorEditPage from './pages/indicator-edit/IndicatorEditPage'
import LineageCanvasPage from './pages/lineage/LineageCanvasPage'
import TagConfigPage from './pages/tag-config/TagConfigPage'
import RuleConfigPage from './pages/rule-config/RuleConfigPage'
import NocObjectTypePage from './pages/noc/NocObjectTypePage'
import NocLinkRelationPage from './pages/noc/NocLinkRelationPage'
import NocPropertyPage from './pages/noc/NocPropertyPage'
import NocTagPage from './pages/noc/NocTagPage'
import NocRulePage from './pages/noc/NocRulePage'
import NocAuditPage from './pages/noc/NocAuditPage'
import InspectionManagementPage from './pages/noc/inspection/InspectionManagementPage'
import KnowledgeManagementPage from './pages/knowledge-management/KnowledgeManagementPage'
import KnowledgeUploadPage from './pages/knowledge-upload/KnowledgeUploadPage'
import IndicatorManagementPage from './pages/indicator-management/IndicatorManagementPage'
import InspectionTodoPage from './pages/business/inspection-todo/InspectionTodoPage'
import PlatformObjectTypePage from './pages/platform/PlatformObjectTypePage'
import PlatformLinkTypePage from './pages/platform/PlatformLinkTypePage'
import PlatformPropertyPage from './pages/platform/PlatformPropertyPage'
import PlatformGraphPage from './pages/platform/PlatformGraphPage'

export default function App() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/indicator/create" element={<IndicatorCreatePage />} />
        <Route path="/indicator/edit/:id" element={<IndicatorEditPage />} />
        <Route path="/indicator-management" element={<IndicatorManagementPage />} />
        <Route path="/lineage" element={<LineageCanvasPage />} />
        <Route path="/tag-config" element={<TagConfigPage />} />
        <Route path="/rule-config" element={<RuleConfigPage />} />
        <Route path="/inspection-todo" element={<InspectionTodoPage />} />
        <Route path="/noc/object-type" element={<NocObjectTypePage />} />
        <Route path="/noc/link-relation" element={<NocLinkRelationPage />} />
        <Route path="/noc/property" element={<NocPropertyPage />} />
        <Route path="/noc/tag" element={<NocTagPage />} />
        <Route path="/noc/rule" element={<NocRulePage />} />
        <Route path="/noc/audit" element={<NocAuditPage />} />
        <Route path="/noc/inspection" element={<InspectionManagementPage />} />
        <Route path="/knowledge-management" element={<KnowledgeManagementPage />} />
        <Route path="/knowledge-upload" element={<KnowledgeUploadPage />} />
        <Route path="/platform/object-type" element={<PlatformObjectTypePage />} />
        <Route path="/platform/link-type" element={<PlatformLinkTypePage />} />
        <Route path="/platform/property" element={<PlatformPropertyPage />} />
        <Route path="/platform/graph" element={<PlatformGraphPage />} />
      </Routes>
    </Layout>
  )
}
