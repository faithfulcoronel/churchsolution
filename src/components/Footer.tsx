import React, { useState } from 'react';
import { Heart, FileText, Shield } from 'lucide-react';
import { Modal } from './ui2/modal';

interface FooterProps {
  sidebarCollapsed: boolean;
}

function Footer({ sidebarCollapsed }: FooterProps) {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);


  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 py-4 px-6 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-72'}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              © {currentYear} Steward Track. All rights reserved.
            </p>
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-2 py-1"
            >
              <Shield className="h-4 w-4 mr-1" />
              Privacy Policy
            </button>
            <button
              onClick={() => setShowTermsModal(true)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-2 py-1"
            >
              <FileText className="h-4 w-4 mr-1" />
              Terms of Service
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center">
            Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> by Cortanatech Solutions, Inc.
          </p>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      <Modal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Privacy Policy"
      >
        <div className="space-y-8">
          <section>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary-600" />
              Information We Collect
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-600 leading-relaxed">
              <p>
                We collect information that you provide directly to us, including personal information such as:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Names and contact information</li>
                <li>Email addresses and phone numbers</li>
                <li>Membership and attendance records</li>
                <li>Financial contribution data</li>
                <li>Ministry participation information</li>
              </ul>
            </div>
          </section>

          <section>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">How We Use Your Information</h4>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-600 leading-relaxed">
              <p>We use the information we collect to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Provide and maintain our church administration services</li>
                <li>Communicate with you about church activities and events</li>
                <li>Process donations and maintain accurate financial records</li>
                <li>Manage membership and attendance records</li>
                <li>Facilitate ministry and volunteer coordination</li>
              </ul>
            </div>
          </section>

          <section>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Information Sharing and Security</h4>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-600 leading-relaxed">
              <p className="mb-4">
                We do not sell or share your personal information with third parties except as necessary to provide our services or as required by law.
              </p>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information, including:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Encryption of sensitive data</li>
                <li>Secure access controls</li>
                <li>Regular security assessments</li>
                <li>Staff training on data protection</li>
              </ul>
            </div>
          </section>

          <section>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Rights and Choices</h4>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-600 leading-relaxed">
              <p>You have the right to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of certain communications</li>
                <li>File a complaint with relevant authorities</li>
              </ul>
              <p className="mt-4">
                Contact your church administrator to exercise these rights or for any privacy-related concerns.
              </p>
            </div>
          </section>
        </div>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Terms of Service"
      >
        <div className="space-y-8">
          <section>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary-600" />
              Acceptance of Terms
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-600 leading-relaxed">
              <p>
                By accessing and using this church administration system, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using the service.
              </p>
            </div>
          </section>

          <section>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">User Responsibilities</h4>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-600 leading-relaxed">
              <p className="mb-4">Users must:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Maintain the confidentiality of their account credentials</li>
                <li>Use the system only for authorized church administration purposes</li>
                <li>Respect the privacy and rights of other users</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Report any security concerns or unauthorized access</li>
              </ul>
            </div>
          </section>

          <section>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">System Usage and Data Privacy</h4>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-600 leading-relaxed">
              <div className="mb-4">
                <h5 className="font-medium mb-2">Acceptable Use</h5>
                <p>
                  The church administration system is provided "as is" and is to be used solely for legitimate church administration purposes. Any unauthorized use or abuse of the system may result in immediate termination of access.
                </p>
              </div>
              <div>
                <h5 className="font-medium mb-2">Data Handling</h5>
                <p>
                  Users agree to handle all personal and sensitive information in accordance with applicable privacy laws and church policies. This includes maintaining confidentiality and using data only for authorized purposes.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Termination and Changes</h4>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-600 leading-relaxed">
              <div className="mb-4">
                <h5 className="font-medium mb-2">Account Termination</h5>
                <p>
                  Access to the system may be terminated for violations of these terms or at the discretion of church administration. Users will be notified of any such action.
                </p>
              </div>
              <div>
                <h5 className="font-medium mb-2">Updates to Terms</h5>
                <p>
                  We reserve the right to modify these terms at any time. Users will be notified of significant changes, and continued use of the system constitutes acceptance of updated terms.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-600 leading-relaxed">
              <p>
                For questions about these Terms of Service or to report violations, please contact your church administrator or system support team.
              </p>
            </div>
          </section>
        </div>
      </Modal>
    </>
  );
}

export default Footer;