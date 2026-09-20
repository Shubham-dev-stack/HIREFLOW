import React from 'react';
import { useHireFlow } from '../../context/HireFlowContext';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { RoleSetupScreen } from '../screens/RoleSetupScreen';
import { CandidateIntakeScreen } from '../screens/CandidateIntakeScreen';
import { EvidenceMatrixScreen } from '../screens/EvidenceMatrixScreen';
import { DecisionQAScreen } from '../screens/DecisionQAScreen';
import { MinimumValidationScreen } from '../screens/MinimumValidationScreen';
import { FinalReviewScreen } from '../screens/FinalReviewScreen';
import { AuditTrailScreen } from '../screens/AuditTrailScreen';
import { DocumentViewerModal } from '../screens/DocumentViewerModal';
import { SettingsModal } from '../screens/SettingsModal';
import { AgentTraceDrawer } from '../common/AgentTraceDrawer';
import { AgentTracePanel } from './AgentTracePanel';

export const AppShell: React.FC = () => {
  const { currentStep } = useHireFlow();

  const renderActiveScreen = () => {
    switch (currentStep) {
      case '01_ROLE':
        return <RoleSetupScreen />;
      case '02_CANDIDATES':
        return <CandidateIntakeScreen />;
      case '03_EVIDENCE':
        return <EvidenceMatrixScreen />;
      case '04_DECISION_QA':
        return <DecisionQAScreen />;
      case '05_VALIDATION':
        return <MinimumValidationScreen />;
      case '06_REVIEW':
        return <FinalReviewScreen />;
      case 'AUDIT_TRAIL':
        return <AuditTrailScreen />;
      default:
        return <RoleSetupScreen />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#F7F8FA] dark:bg-[#0F1117] overflow-hidden font-sans text-slate-900 dark:text-[#F1F5F9] transition-colors">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main App Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <TopBar />

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#F7F8FA] dark:bg-[#0F1117] pb-16 transition-colors">
          {renderActiveScreen()}
        </main>
      </div>

      {/* Persistent Right Agent Panel (desktop ≥1024px collapsible to rail, mobile floating trigger) */}
      <AgentTracePanel />

      {/* Global Modals & Overlays */}
      <DocumentViewerModal />
      <SettingsModal />
      <AgentTraceDrawer />
    </div>
  );
};
