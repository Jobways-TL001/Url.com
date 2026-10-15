import React from "react";
import { Link } from "react-router-dom";
import Header from "../Header/header";
import Footer from "../Footer/footer";
import LegalDocument from "./LegalDocument";
import { COMPANY } from "../../constants/company";
import { ROUTES } from "../../constants/routes";
import "./Terms.css";

function TermsAndConditions() {
  return (
    <>
      <Header />
      <LegalDocument title="Terms and Conditions">
        <h2>ABOUT COMPANY – URL</h2>
        <p>
          <strong>1.1</strong> <a href={COMPANY.siteUrl}>{COMPANY.domain}</a>{" "}
          (the "Web Application"), the courses, jobs, resumes, available from
          the Web Application (the "URL"), and the training services made
          available on or through the Web Application and the software (the
          "Services"), are developed, owned, operated and maintained, as
          applicable, by {COMPANY.legalName} (hereinafter referred to as "we", "our",
          "us", or the "Company", as the case may be).
        </p>
        <p>
          <strong>1.2</strong> The Web Application consists jobs, resumes,
          courses, and services are collectively referred to as the "Company
          Products and Services."
        </p>
        <p>
          <strong>1.2.1</strong> Accepting or using or accessing the Company
          Products and Services, including, but not limited to streaming live.
        </p>
        <p>
          <strong>1.2.2</strong> Accepting or accessing or using the software,
          buying, paying, either for itself or for someone else to use or access
          the Company Products and Services, user agree and accept to the terms
          and conditions set forth in these Terms of Use (the "Terms").
        </p>
        <p>
          <strong>1.3</strong> All these terms, unless the same has been
          explicitly excluded by any other instrument or person to which the
          Company and/or an user are subject to, including this introductory
          section, create a binding legal contract between user and the Company.
        </p>
        <p>
          <strong>1.4</strong> By using the Company Products and Services, user
          represent liable and accreditation that user have read, understood,
          and agree to be declare and bound by these Terms. If user do deny
          these terms, user must not use - and are not authorized to use - all
          or any portion of the Company Products and Services.
        </p>
        <p>
          <strong>1.5</strong> For the aim s of the terms, the term
          “user(s)/user” shall mean and include all persons, natural or
          artificial, that visit the Web Application including those that have
          agreed to become registered users on the Web Application by providing
          registration data while registering on the Web Application as
          registered users accessing or using the Company Products and Services
          through the Web Application.
        </p>
        <p>
          <strong>1.6</strong> If user is an owner, third party, tutor,
          counsellor, parent, guardian, or other natural person who enables a
          child to access the Company Products and Services, user agree to stand
          in the place of such child for the aim s of making url.com whole
          in case of damages or indemnification that could properly lie against
          a child, if not for his or her age. This Web Application is intended
          for use or access by a natural person only if such natural person is
          13 (thirteen) years of age or older.
        </p>
        <p>
          <strong>1.7</strong> If users are using or creating an account to use
          the Company Products and Services on behalf of a company, entity or
          organization (each a "Subscribing Entity"), then user represent and
          accreditation that user: (i) are an authorized representative of that
          Subscribing Entity with the authority to bind such entity to these
          Terms, and (ii) agree to be bound by these Terms on behalf of such
          Subscribing Entity.
        </p>
        <h2>USER ACCOUNT INFORMATION</h2>
        <p>
          <strong>2.1</strong> User is and shall be liable for maintaining the
          confidentiality of his/her password and account, and is/shall be fully
          liable for all activities that take place under his/her password or
          account with or without user’s knowledge.
        </p>
        <p>
          <strong>2.2</strong> In the event user provides his/her login and
          password details to another person, user’s authorities may be
          suspended temporarily or discontinued.
        </p>
        <p>
          <strong>2.3</strong> User agrees to immediately notify to Company of
          any unapproved use of password or account of any other breach of
          security.
        </p>
        <p>
          <strong>2.4</strong> Company cannot and shall not be liable for any
          loss or damage arising from user’s not complying with the provisions
          of this section.
        </p>
        <p>
          <strong>2.5</strong> In consideration of user use of Company Products
          and Services, user agree to
        </p>
        <p>
          {" "}
          <strong>2.5.1</strong> provide true, accurate, current and complete
          information about user as prompted by Company's registration form
          (such information being "User Data").
        </p>
        <p>
          {" "}
          <strong>2.5.2</strong> maintain and promptly update user data to keep
          it true, accurate, current and complete.
        </p>
        <p>
          {" "}
          <strong>2.5.3</strong> comply with these terms. If user provide any
          information that is untrue, inaccurate, not current, incomplete or
          misleading, or if URL.com believe that such information is untrue,
          inaccurate, not current incomplete or misleading, then URL.com
          reserve the right to suspend or discontinue user account and refuse or
          restrict any and all current or future use of the Company Products and
          Services, without any liability to user.
        </p>
        <p>
          <strong>2.6</strong> Any data materials, information, communications
          or ideas that user upload, communicate or otherwise transmit or post
          to Web Application on or through Company Products and Services (the
          "Submitted Content") will be treated as non-confidential and subject
          to the license below, and may be reproduced, distributed, publicly
          performed, publicly distributed, communicated to the public, and
          otherwise used and exploited by URL.com for any aim related to the
          delivery, marketing, promoting, demonstrating or operating the Company
          Products and Services, including, but not limited to, for quality
          control, redistribution or display to users, and professional
          development.
        </p>
        <h2>CONDUCT AND BEHAVIOR</h2>
        <p>
          <strong>3.1</strong> User may not respond to postings by other users
          in any manner or for any aim other than that which is expected (i.e.,
          to apply for the job or to initiate further discussion with the
          candidate).
        </p>
        <p>
          <strong>3.2</strong> Communications soliciting the client’s/
          employer's business are prohibited.
        </p>
        <p>
          <strong>3.3</strong> User may not send unsolicited commercial email to
          users.
        </p>
        <p>
          <strong>3.4</strong> Protect user password.
        </p>
        <p>
          <strong>3.5</strong> User account and any related services accessed
          through such account are to be accessed and used solely by user.
        </p>
        <p>
          <strong>3.6</strong> Upon user successful registration for a user
          account, user will be provided with a unique password that will permit
          user to access the account.
        </p>
        <p>
          <strong>3.7</strong> User may not provide user password or otherwise
          permit access to user Company account to any third party. User are
          liable for maintaining the confidentiality of user information and
          password.
        </p>
        <p>
          <strong>3.8</strong> User agree to protect and keep user password
          confidential, to change user password on a regular basis, and to
          maintain appropriate and regularly updated malware scanning and
          cleaning tools on user network and individual device(s).
        </p>
        <p>
          <strong>3.9</strong> User are liable for all uses of user account,
          whether or not authorized by user.
        </p>
        <p>
          <strong>3.10</strong> If others use user password to post
          inappropriate material on the Web Applications, user risk losing user
          access to the Web Applications.
        </p>
        <p>
          <strong>3.11</strong> User agree to notify Company immediately of any
          unapproved use of user account or password, report inappropriate
          postings or conduct to feedback.
        </p>
        <p>
          <strong>3.12</strong> User may not delete or revise any data material
          posted by any other person or entity.
        </p>
        <p>
          <strong>3.13</strong> If at any time Company comes to the
          understanding that user: (i) mislead Company regarding user business
          products and/or practices and/or services, or (ii) purchased services
          that do not represent user precise business, Company reserves the
          right to discontinue user agreement.
        </p>
        <p>
          <strong>3.14</strong> User shall only access the Company Products and
          Services for lawful aims.
        </p>
        <p>
          <strong>3.15</strong> User are solely liable for the knowledge of and
          adherence to any and all laws, rules, and regulations pertaining to
          user use of the Company Products and Services.
        </p>
        <p>
          <strong>3.16</strong> User agree not to use the Company Products and
          Services or the Company Content (as defined below) to recruit,
          solicit, or contact in any form instructors or potential users for
          training, employment or contracting for a business not affiliated with
          URL.com without our advance written permission, which may be
          withheld in our sole discretion.
        </p>
        <p>
          <strong>3.17</strong> User assume any and all risks from any meetings
          or contact between user and any instructors or other users of Company
          Products and Services.
        </p>
        <p>
          <strong>3.18</strong> User should be careful before meeting any
          instructor or other user in person and should only do so in public.
          Remember to always be safe.
        </p>

        <h2>4. COPYRIGHT AND SECURITY</h2>
        <p>
          <strong>4.1</strong> THE DIGITAL MILLENNIUM COPYRIGHT ACT OF 1998 (THE
          "DMCA") PROVIDES RECOURSE FOR COPYRIGHT OWNERS WHO BELIEVE THAT
          MATERIAL APPEARING ON THE INTERNET INFRINGES THEIR RIGHTS UNDER U.S.
          COPYRIGHT LAW. IF USER HAVE A GOOD FAITH BELIEF THAT MATERIALS HOSTED
          BY URL.COM INFRINGE USER COPYRIGHT, USER (OR USER AGENT) MAY SEND
          URL.COM A NOTICE REQUESTING THAT THE MATERIAL BE REMOVED, OR
          ACCESS TO IT BLOCKED.
        </p>
        <p>
          <strong>4.2</strong> THE NOTICE MUST INCLUDE THE FOLLOWING
          INFORMATION:
        </p>
        <p>
          <strong>4.2.1</strong> A PHYSICAL OR ELECTRONIC SIGNATURE OF A PERSON
          AUTHORIZED TO ACT ON BEHALF OF THE OWNER OF AN EXCLUSIVE RIGHT THAT IS
          ALLEGEDLY BEING INFRINGED UPON;
        </p>
        <p>
          <strong>4.2.2</strong> IDENTIFICATION OF THE COPYRIGHTED WORK CLAIMED
          TO HAVE BEEN INFRINGED UPON (OR IF MULTIPLE COPYRIGHTED WORKS LOCATED
          ON THE WEB APPLICATION ARE COVERED BY A SINGLE NOTIFICATION, A
          REPRESENTATIVE LIST OF SUCH WORKS);
        </p>
        <p>
          <strong>4.2.3</strong> IDENTIFICATION OF THE MATERIAL THAT IS CLAIMED
          TO BE INFRINGING OR THE SUBJECT OF INFRINGING ACTIVITY, AND
          INFORMATION REASONABLY SUFFICIENT TO ALLOW URL.COM TO LOCATE THE
          MATERIAL ON THE WEB APPLICATION;
        </p>
        <p>
          <strong>4.2.4</strong> THE NAME, ADDRESS, TELEPHONE NUMBER, AND E-MAIL
          ADDRESS (IF AVAILABLE) OF THE COMPLAINING PARTY;
        </p>
        <p>
          <strong>4.2.5</strong> A STATEMENT THAT THE COMPLAINING PARTY HAS A
          GOOD FAITH BELIEF THAT USE OF THE MATERIAL IN THE MANNER COMPLAINED OF
          IS NOT AUTHORIZED BY THE COPYRIGHT OWNER, ITS AGENT, OR THE LAW;
        </p>
        <p>
          <strong>4.2.6</strong> A STATEMENT THAT THE INFORMATION IN THE
          NOTIFICATION IS ACCURATE, AND UNDER PENALTY OF PERJURY, THAT THE
          COMPLAINING PARTY IS AUTHORIZED TO ACT ON BEHALF OF THE OWNER OF AN
          EXCLUSIVE RIGHT THAT IS ALLEGEDLY INFRINGED.
        </p>
        <p>
          <strong>4.3</strong> IF USER BELIEVE IN GOOD FAITH THAT A NOTICE OF
          COPYRIGHT INFRINGEMENT HAS BEEN WRONGLY FILED AGAINST USER, THE DMCA
          PERMITS USER TO SEND URL.COM A COUNTER-NOTICE.
        </p>
        <p>
          <strong>4.4</strong> NOTICES AND COUNTER-NOTICES MUST MEET THE
          THEN-CURRENT STATUTORY REQUIREMENTS IMPOSED BY THE DMCA; SEE
          HTTPS://WWW.COPYRIGHT.GOV/ FOR DETAILS.
        </p>
        <p>
          <strong>4.5</strong> NOTICES AND COUNTER-NOTICES WITH RESPECT TO THE
          WEB APPLICATION SHOULD BE SENT TO COMPANY ADDRESS.
        </p>
        <p>
          <strong>4.6</strong> ATTENTION: VICE PRESIDENT & GENERAL COUNSEL.
          URL.COM SUGGEST THAT USER CONSULT USER LEGAL ADVISOR BEFORE FILING
          A NOTICE OR COUNTER-NOTICE. ALSO, BE AWARE THAT THERE CAN BE PENALTIES
          FOR FALSE CLAIMS UNDER THE DMCA.
        </p>
        <p>
          <strong>4.7</strong> USER ACKNOWLEDGE THAT THE SOFTWARE, THE
          TECHNOLOGY UNDERLYING THE SERVICES, AND ALL OTHER SOFTWARE, DESIGNS,
          MATERIALS, INFORMATION, COMMUNICATIONS, TEXT, GRAPHICS, LINKS,
          ELECTRONIC ART, ANIMATIONS, ILLUSTRATIONS, ARTWORK, AUDIO CLIPS, VIDEO
          CLIPS, PHOTOS, IMAGES, AND OTHER DATA OR COPYRIGHTABLE MATERIALS,
          INCLUDING THE SELECTION AND ARRANGEMENTS THEREOF, PROVIDED OR MADE
          AVAILABLE TO USER IN CONNECTION WITH THE COMPANY PRODUCTS AND SERVICES
          (COLLECTIVELY, THE "COMPANY CONTENT") ARE THE PROPRIETARY PROPERTY OF
          COMPANY AND ITS AFFILIATED AND/OR THIRD PARTY PROVIDERS AND SUPPLIERS
          (THE "THIRD PARTIES").
        </p>
        <p>
          <strong>4.8</strong> USER AGREE THAT ANY AND ALL MATERIAL DISPLAYED ON
          THE WEB APPLICATION IS SOLELY FOR USER PERSONAL USE AND USER SHALL
          NOT, WHETHER DIRECTLY OR INDIRECTLY, COPY, REPRODUCE, REPUBLISH, POST,
          UPLOAD, TRANSMIT OR DISTRIBUTE SUCH MATERIAL IN ANY MANNER AND THROUGH
          ANY MEDIA INCLUDING BY WAY OF E-MAIL OR OTHER ELECTRONIC MEANS AND
          SHALL NOT ASSIST ANY OTHER PERSON IN DOING SO.
        </p>
        <p>
          <strong>4.9</strong> MODIFICATION OF THE SAID MATERIALS OR USE OF THE
          MATERIALS ON ANY OTHER WEB APPLICATION OR NETWORKED DEVICE ENVIRONMENT
          OR USE OF THE MATERIALS FOR ANY AIM OTHER THAN PERSONAL USE IS A
          VIOLATION OF THE SAID COPYRIGHTS, AND OTHER INTELLECTUAL PROPRIETARY
          RIGHTS, AND IS EXPRESSLY PROHIBITED.
        </p>
        <p>
          <strong>4.10</strong> UNLESS OTHERWISE SPECIFIED, WHEN ANY CONTENT IS
          DOWNLOADED TO USER’S DEVICE, USER DO NOT OBTAIN ANY OWNERSHIP INTEREST
          IN SUCH CONTENT OR ANY USE OF THE CONTENT FOR ANY OTHER AIM.
        </p>
        <p>
          <strong>4.11</strong> THE COMPANY RESERVES ALL RIGHTS NOT EXPRESSLY
          GRANTED TO USER.
        </p>
        <p>
          <strong>4.12</strong> COURSES, JOBS, RESUMES OFFERED BY COMPANY ARE
          AUTHORED AND COPYRIGHTED BY THIRD PARTIES.
        </p>
        <p>
          <strong>4.13</strong> THESE THIRD PARTIES HAVE GIVEN A SIGNED
          DECLARATION TO COMPANY THAT THE COURSE, JOBS, RESUMES CONTENT AND
          TRAINING MATERIALS ARE DEVELOPED WITHOUT INFRINGING ANY COPYRIGHTED
          ARTICLE.
        </p>
        <p>
          <strong>4.14</strong> IN CASE ANY OF THE JOBS, RESUMES, COURSE CONTENT
          OR TRAINING MATERIAL IS FOUND TO BE IN INFRINGEMENT OF ANY COPYRIGHTED
          ARTICLE, THE SAME MAY BE BROUGHT TO THE NOTICE OF COMPANY BY SENDING
          AN EMAIL WITH COMPLETE DETAILS OF THE INFRINGEMENT TO COMPANY EMAIL
          ADDRESS COPYRIGHTS@URL.COM.
        </p>
        <p>
          <strong>4.15</strong> AFTER PRELIMINARY INVESTIGATION IF THE JOBS,
          RESUMES, COURSE IS FOUND TO BE IN INFRINGEMENT OF THE COPYRIGHTED
          ARTICLE, THE SAME WILL BE SUSPENDED TILL THE FINAL OUTCOME OF THE
          DETAILED INVESTIGATION.
        </p>
        <p>
          <strong>4.16</strong> SINCE COMPANY ONLY PROVIDES A PLATFORM WHERE
          USERS / AUTHORS CAN HOST THEIR COPYRIGHTED COURSES, JOBS, RESUMES ANY
          LEGAL ACTION FOR COPYRIGHT INFRINGEMENT CAN ONLY BE INITIATED ON THE
          USERS / AUTHORS AND NOT ON COMPANY.
        </p>
        <p>
          <strong>4.17</strong> COMPANY CAN PROVIDE DETAILS OF THE USERS /
          AUTHORS OF A JOBS, RESUMES, COURSE UPON SPECIFIC REQUEST IF PROVED TO
          THE SATISFACTION OF COMPANY THAT A PARTICULAR COURSE, JOBS, RESUMES
          ARE COPYRIGHT INFRINGEMENT.
        </p>
        <h2>5. FEES/COSTS AND EQUIPMENT/DEVICES</h2>
        <p>
          <strong>5.1</strong> USER ARE SOLELY LIABLE FOR ALL DEVICES, SERVICE,
          INTERNET, TELEPHONY AND/OR OTHER FEES AND COSTS ASSOCIATED WITH USER
          ACCESS TO AND USE OF THE COMPANY PRODUCTS AND SERVICES, INCLUDING, BUT
          NOT LIMITED TO, ANY DATA CHARGES IMPOSED BY A WIRELESS CARRIER OR
          INTERNET SERVICE PROVIDER, AND FOR OBTAINING AND MAINTAINING ALL
          TELEPHONE, DEVICE HARDWARE, AND OTHER EQUIPMENT REQUIRED FOR SUCH
          ACCESS AND USE.
        </p>
        <p>
          <strong>5.2</strong> THE COMPANY URL.COM USES INTERNALLY DEVELOPED
          SYSTEMS FOR MAKING THE COMPANY PRODUCTS AND SERVICES AVAILABLE TO THE
          USER.
        </p>
        <p>
          <strong>5.3</strong> THESE SYSTEMS MAY ENCOUNTER TECHNICAL OR OTHER
          LIMITATIONS, AND DEVICE AND COMMUNICATIONS HARDWARE SYSTEMS MIGHT
          EXPERIENCE INTERRUPTIONS.
        </p>
        <p>
          <strong>5.4</strong> FURTHER, THE COMPANY CONTINUALLY ENHANCES AND
          IMPROVES THESE SYSTEMS IN ORDER TO ACCOMMODATE THE LEVEL OF USE OF THE
          WEB APPLICATION.
        </p>
        <p>
          <strong>5.5</strong> THE COMPANY MAY ALSO ADD ADDITIONAL FEATURES AND
          FUNCTIONALITY TO THE COMPANY PRODUCTS AND SERVICES THAT MIGHT RESULT
          IN THE NEED TO DEVELOP OR LICENSE ADDITIONAL TECHNOLOGIES.
        </p>
        <p>
          <strong>5.6</strong> INCREASED UTILIZATION OF THE WEB APPLICATION OR
          PROVIDING NEW FEATURES OR FUNCTIONALITY MAY CAUSE UNANTICIPATED SYSTEM
          DISRUPTIONS, SLOWER RESPONSE TIMES, DEGRADATION IN LEVELS OF CUSTOMER
          SERVICE, AND DELAYS IN REPORTING ACCURATE FINANCIAL INFORMATION.
        </p>
        <p>
          <strong>5.7</strong> THE USER AGREES THAT THE COMPANY SHALL NOT BE
          LIABLE TO THE USER OR TO ANY THIRD PARTY CLAIMING THROUGH THE USER FOR
          ANY SUCH FAILURES CONTEMPLATED HEREIN.
        </p>
        <p>
          <strong>5.8</strong> IF PRODUCTS OR SERVICES ARE MADE AVAILABLE AT THE
          WEB APPLICATION, AND IF USER WISH TO LICENSE OR MAKE PURCHASES OF
          PRODUCTS OR SERVICES DESCRIBED ON THE WEB APPLICATION, USER MAY BE
          ASKED BY URL.COM OR THE APPLICABLE MERCHANT OR SERVICE PROVIDER TO
          SUPPLY CERTAIN INFORMATION, INCLUDING BUT NOT LIMITED TO CREDIT CARD
          OR OTHER INFORMATION.
        </p>
        <p>
          <strong>5.9</strong> IF USER SUBMIT SUCH INFORMATION TO US, USER
          UNDERSTAND THAT ANY SUCH INFORMATION WILL BE TREATED BY COMPANY IN THE
          MANNER DESCRIBED IN OUR PRIVACY POLICY.
        </p>
        <p>
          <strong>5.10</strong> USER AGREE THAT ALL INFORMATION THAT USER
          PROVIDE TO URL.COM OR ANY SUCH BANKING, MERCHANT OR SERVICE
          PROVIDER WILL BE ACCURATE, COMPLETE AND CURRENT.
        </p>
        <p>
          <strong>5.11</strong> USER AGREE TO PAY ALL CHARGES INCURRED BY USER
          OR ANY USERS OF USER ACCOUNT AND CREDIT CARD OR OTHER PAYMENT
          MECHANISM AT THE PRICES IN EFFECT WHEN SUCH CHARGES ARE INCURRED.
        </p>
        <p>
          <strong>5.12</strong> USER WILL ALSO BE LIABLE FOR PAYING ANY
          APPLICABLE TAXES RELATING TO USER PURCHASES.
        </p>
        <p>
          <strong>5.13</strong> MOREOVER, USER AGREE TO REVIEW AND TO COMPLY
          WITH THE TERMS AND CONDITIONS OF ANY SPECIFIC AGREEMENT, IF ANY, THAT
          USER ENTER INTO WITH THE MERCHANT AND/OR SERVICE PROVIDER IN
          CONNECTION WITH THE LICENSING OR PURCHASE OF ANY PRODUCT OR SERVICE ON
          WEB APPLICATION.
        </p>
        <h2>6. DISPUTE AND CLAIMS</h2>
        <p>
          <strong>6.1</strong> MANDATORY ARBITRATION. PLEASE READ THIS
          CAREFULLY. IT AFFECTS YOUR RIGHTS. YOU AND THE COMPANY AND EACH OF OUR
          RESPECTIVE SUBSIDIARIES, AFFILIATES, PREDECESSORS IN INTEREST,
          SUCCESSORS, AND PERMITTED ASSIGNS AGREE TO ARBITRATION (EXCEPT FOR
          MATTERS THAT MAY BE TAKEN TO SMALL CLAIMS COURT) IN ACCORDANCE WITH
          THE FEDERAL ARBITRATION ACT, AS THE EXCLUSIVE FORM OF DISPUTE
          RESOLUTION EXCEPT AS PROVIDED FOR ALL DISPUTES AND CLAIMS ARISING OUT
          OF OR RELATING TO THESE TERMS OR YOUR USE OF THE COMPANY PRODUCTS AND
          SERVICES.
        </p>
        <p>
          <strong>6.2</strong> THERE SHALL BE ONE (1) ARBITRATOR MUTUALLY
          APPOINTED BY BOTH THE COMPANY AND YOU. THE SEAT OF THE ARBITRATION
          SHALL BE NEW YORK, USA. THE LANGUAGE OF THE ARBITRATION PROCEEDINGS
          AND ALL WRITTEN DECISIONS AND CORRESPONDENCE RELATING TO THE
          ARBITRATION SHALL BE IN ENGLISH.
        </p>
        <p>
          <strong>6.3</strong> THESE TERMS SHALL BE GOVERNED BY AND CONSTRUED IN
          ACCORDANCE WITH THE LAWS OF THE UNITED STATES OF AMERICA AND, SUBJECT
          TO THE ARBITRATION PROVISIONS SET OUT HEREIN, THE COURTS IN DELAWARE
          SHALL HAVE EXCLUSIVE JURISDICTION OVER ANY DISPUTES ARISING OUT OF OR
          IN CONNECTION WITH THESE TERMS.
        </p>
        <h2>7. TAXES AND FEES/COST</h2>
        <p>
          <strong>7.1</strong> ACCESSING THE WEB APPLICATION AND BROWSING
          COURSES, JOBS IS FREE OF COST.
        </p>
        <p>
          <strong>7.2</strong> COMPANY HOWEVER RESERVES THE RIGHT TO CHANGE ITS
          FEE POLICIES AT ANY TIME IN ITS SOLE DISCRETION, INCLUDING CHARGING
          FOR ACCESS TO THE WEB APPLICATION, BUT NO FEE CHANGE WILL BE BINDING
          UPON USER UNTIL USER AGREE TO SUCH FEE CHANGES.
        </p>
        <p>
          <strong>7.3</strong> UNLESS OTHERWISE STATED, ALL FEES ARE QUOTED IN
          UNITED STATES DOLLARS.
        </p>
        <p>
          <strong>7.4</strong> USER ARE LIABLE FOR PAYING ALL FEES AND
          APPLICABLE TAXES ASSOCIATED WITH THE WEB APPLICATION IN A TIMELY
          MANNER WITH A VALID PAYMENT METHOD THAT IS ACCEPTED BY THE COMPANY IN
          ITS SOLE DISCRETION.
        </p>
        <p>
          <strong>7.5</strong> IF USER PAYMENT METHOD FAILS OR USER ACCOUNT IS
          PAST DUE, THEN URL.COM MAY COLLECT FEES OWED USING OTHER
          COLLECTION MECHANISMS.
        </p>
        <p>
          <strong>7.6</strong> THIS MAY INCLUDE CHARGING OTHER PAYMENT METHODS
          ON FILE WITH URL.COM AND/OR RETAINING COLLECTION AGENCIES AND
          LEGAL COUNSEL.
        </p>
        <p>
          <strong>7.7</strong> URL.COM MAY ALSO BLOCK USER ACCESS TO ANY
          COMPANY PRODUCTS AND SERVICES PENDING RESOLUTION OF ANY AMOUNTS DUE BY
          USER TO OUR COMPANY.
        </p>
        <h2>8. General Terms</h2>
        <p>
          <strong>8.1</strong> The company products and services enable the
          users to view, learn via browsing, live and recorded instruction,
          tutoring, and learning services through our proprietary software.
        </p>
        <p>
          <strong>8.2</strong> The services include, without limitation,
          facilitating jobs, resumes and hosting courses, and taking feedback
          from users.
        </p>
        <p>
          <strong>8.3</strong> User understand and agree that these terms are
          agreed to in consideration of user use of the company products and
          services and other good and valuable consideration, the receipt and
          sufficiency of which are hereby acknowledged.
        </p>
        <p>
          <strong>8.4</strong> The web applications are intended for individuals
          seeking employment and for employers or recruiters seeking candidates
          for employment.
        </p>
        <p>
          <strong>8.5</strong> User may use the web applications only for lawful
          aims within the stated context of company's intended and acceptable
          use of the web applications.
        </p>
        <p>
          <strong>8.6</strong> Company is the sole interpreter of the web
          applications' intended and acceptable use.
        </p>
        <p>
          <strong>8.7</strong> Use any search engine, software, tool, electronic
          storage or retrieval device, agent or other device or mechanism,
          including without limitation browsers, spiders, robots, avatars or
          intelligent agents (collectively "devices") that is not approved by
          company to navigate, search or store information from the web
          application.
        </p>
        <p>
          <strong>8.8</strong> Approved devices include those made available by
          company on the web application, or other generally available third
          party web browsers, e.g., Mozilla Firefox, Google Chrome, Microsoft
          Internet Explorer, or generally available search engines, e.g., Google
          or Bing.
        </p>
        <p>
          <strong>8.9</strong> Allow job postings or employment requirements to
          remain posted on the web application for more than 24 hours after they
          are no longer viable or valid.
        </p>
        <p>
          <strong>8.10</strong> To the extent that a position is placed on
          "hold" or is otherwise not available for immediate placement, the
          posting must be removed from the web application until such time as
          the position is a viable opening.
        </p>

        <h2>9. Changes to These Terms</h2>
        <p>
          <strong>9.1</strong> Company reserves the absolute right to revise
          these terms in its sole discretion at any time and without prior
          notice to user other than by posting the revised terms on the web
          application.
        </p>
        <p>
          <strong>9.2</strong> Any revisions to the terms are effective upon
          posting.
        </p>
        <p>
          <strong>9.3</strong> The terms will be identified as of the most
          recent date of revision.
        </p>
        <p>
          <strong>9.4</strong> User should visit this page regularly to ensure
          user continued acceptance of these terms.
        </p>
        <p>
          <strong>9.5</strong> User continued use of the company products and
          services after any revision to these terms constitutes user binding
          acceptance of the revised terms.
        </p>
        <p>
          <strong>9.6</strong> Notwithstanding the preceding sentences of this
          section, no revisions to these terms will apply to any dispute between
          user and the company that arose prior to the date of such revision.
        </p>
        <p>
          <strong>9.7</strong> Evolving Nature of Services.
        </p>
        <p>
          <strong>9.7.1</strong> The company products and services are new and
          subject to change at any time.
        </p>
        <p>
          <strong>9.7.2</strong> URL.com are continually looking to improve
          the company products and services but if user are at any time
          dissatisfied with the company products and services, then user sole
          remedy is to discontinue use of the company products and services.
        </p>

        <h2>9.8. Electronic Notices</h2>
        <p>
          <strong>9.8.1</strong> By using the company products and services or
          communicating with us, user agree that url.com may communicate
          with user electronically regarding security, privacy, and
          administrative issues relating to user use of the company products and
          services.
        </p>
        <p>
          <strong>9.8.2</strong> If url.com learn of a security system's
          breach, url.com may attempt to notify user electronically by
          posting a notice on the web application or sending an email to user.
        </p>

        <h2>10. Indemnifications</h2>
        <p>
          <strong>10.1</strong> User agree to indemnify, defend and hold us, our
          affiliates, sponsors, officers, directors, employees, agents and
          representatives harmless from and against any and all claims, damages,
          losses, costs (including reasonable attorneys’ fees), or other
          expenses that arise directly or indirectly out of or from user use of
          the web application.
        </p>
        <p>
          <strong>10.2</strong> User agree to indemnify, defend and hold
          harmless us, and our affiliates, officers, directors, agents,
          partners, employees, licensors, representatives and third party
          providers (including our affiliates' respective officers, directors,
          agents, partners, employees, licensors, representatives, and third
          party providers), from and against all losses, expenses, damages,
          costs, claims and demands, including reasonable attorneys' fees and
          related costs and expenses, due to or arising out of any content user
          submit, post to, email, or otherwise transmit to url.com or
          through the web application or services, user use of the company
          products and services, the company content or any portion thereof,
          user connection to the web application or services, or user breach of
          these terms.
        </p>
        <p>
          <strong>10.3</strong> URL.com reserve the right, at our own
          expense, to assume the exclusive defense and control of any matter
          otherwise subject to indemnification by user, and in such case, user
          agree to fully cooperate with such defense and in asserting any
          available defenses.
        </p>

        <h2>11. Liability</h2>
        <p>
          <strong>11.1</strong> Under no circumstances, including, but not
          limited to, negligence, shall company, or any of its officers,
          directors, employees, agents, successors or assigns, or any other
          contractors or third parties be liable for any direct, indirect,
          special, incidental or consequential damages, including, but not
          limited to, loss of data or profit, arising out or relating to the
          use, or the inability to use, the company content, the company
          products and services, courses, submitted jobs, resumes content or any
          portion thereof, even if url.com or an authorized representative
          of company has been advised of the possibility of such damages.
        </p>
        <p>
          <strong>11.2</strong> If user use of the company products and
          services, company content, services or submitted content or any
          portion thereof results in the need for servicing, repair or
          correction of equipment or data, user assume any and all costs
          thereof.
        </p>
        <p>
          <strong>11.3</strong> In no event shall company or its licensors or
          suppliers be liable in the aggregate for any damages incurred by user
          that exceed the greater of (a) one hundred dollars or (b) the amount
          of commissions company has received as a result of user use of company
          products and services in the 12 months prior to the action giving rise
          to the liability.
        </p>

        <h2>12. Link and Hyperlinks</h2>
        <p>
          <strong>12.1</strong> This web application may contain links to other
          web applications operated by third parties, other than affiliates of
          the company ("linked web applications").
        </p>
        <p>
          <strong>12.2</strong> URL.com neither control nor endorse such
          other web applications, nor have url.com reviewed or approved any
          content that appears on the linked web applications.
        </p>
        <p>
          <strong>12.3</strong> User acknowledge that when user click on a link
          to visit a linked web application, a frame may appear that contains
          the company logo, advertisements and/or other content selected by the
          company.
        </p>
        <p>
          <strong>12.4</strong> User acknowledge that the company and its
          sponsors neither endorse nor are affiliated with the linked web
          applications and are not liable for any content that appears on the
          linked web applications.
        </p>
        <p>
          <strong>12.5</strong> User also acknowledge that the owner of the
          linked web application neither endorses nor is affiliated with the
          company and its sponsors.
        </p>
        <p>
          <strong>12.6</strong> As user use the company products and services
          user may notice links to third-party web applications ("third party
          web applications").
        </p>
        <p>
          <strong>12.7</strong> This may include instructors sending links to
          third party web applications and/or causing third party web
          applications (such as study resources or online education pages) to
          pop-up for user review.
        </p>
        <p>
          <strong>12.8</strong> These links are for convenience only.
        </p>
        <p>
          <strong>12.9</strong> If user use these links, user will leave the web
          application.
        </p>
        <p>
          <strong>12.10</strong> Certain of these third-party web applications
          may make use of company proprietary intellectual property rights (such
          as copyrights, service marks, logos) under license from company.
        </p>
        <p>
          <strong>12.11</strong> Company is not liable for the availability or
          content of these third party web applications or for any viruses or
          other damaging elements encountered in linking to a third party web
          application, whether or not company is affiliated with the owners of
          such third party web applications.
        </p>
        <p>
          <strong>12.12</strong> In addition, the provisioning of these links to
          third party web applications is not an endorsement or approval by
          company of the organizations sponsoring such third party web
          applications or their products or services, and user may be subjected
          to offensive, harmful, or damaging content on such third party web
          applications.
        </p>
        <p>
          <strong>12.13</strong> These terms do not apply to third party web
          applications, and user should review applicable terms and policies,
          including any relevant privacy policies, associated with any third
          party web applications, applications, software or services.
        </p>
        <p>
          <strong>12.14</strong> User agree that company will not be liable or
          liable for any loss or damage of any sort incurred as the result of
          any such dealings user may have on or through a third party web
          application or as the result of the presence of any content or
          advertising on the third party web applications.
        </p>

        <h2>13. Miscellaneous</h2>
        <p>
          <strong>13.1</strong> This agreement shall be governed by and
          construed in accordance with the laws of {COMPANY.jurisdiction || "the jurisdiction in which the Company is registered"},
          excluding its choice of law rules.
        </p>
        <p>
          <strong>13.2</strong> Each party to this agreement hereby submits to
          the exclusive jurisdiction of the courts of {COMPANY.jurisdiction || "the jurisdiction in which the Company is registered"} for any
          dispute arising under or in connection
          with this agreement, the web application or any web
          application-related services, and waives any jurisdictional, venue, or
          inconvenient forum objections to such courts.
        </p>
        <p>
          <strong>13.3</strong> In any action to enforce this agreement, the
          prevailing party shall be entitled to costs and attorneys' fees.
        </p>
        <p>
          <strong>13.4</strong> In the event that any of the provisions of this
          agreement are held by a court or other tribunal of competent
          jurisdiction to be unenforceable, such provisions shall be limited or
          eliminated to the minimum extent necessary so that this agreement
          shall otherwise remain in full force and effect and enforceable.
        </p>
        <p>
          <strong>13.5</strong> Failure of any party to insist upon strict
          compliance with any of the terms and conditions of this agreement
          shall not be deemed a waiver or relinquishment of any similar right or
          power at any subsequent time.
        </p>
        <p>
          <strong>13.6</strong> This agreement constitutes the entire agreement
          between the parties hereto pertaining to the subject matter hereof,
          and any and all written or oral agreements heretofore existing between
          the parties are expressly canceled.
        </p>
        <p>
          <strong>13.7</strong> This agreement is not assignable, transferable,
          or sub-licensable by the user except with prior written consent.
        </p>
        <p>
          <strong>13.8</strong> Any heading, caption, or section title contained
          in this agreement is inserted only as a matter of convenience and in
          no way defines or explains any section or provision hereof.
        </p>
        <p>
          <strong>13.9</strong> The company reserves the right in its sole
          discretion to discontinue the use of the web application by a user at
          any time.
        </p>
        <h2>14. Entire Agreement</h2>
        <p>
          <strong>14.1</strong> These terms and any policies applicable to user
          posted on the web application constitute the entire agreement between
          the parties with respect to the subject matter hereof, and supersede
          all previous url.com written or oral agreements between the
          parties with respect to such subject matter.
        </p>
        <p>
          <strong>14.2</strong> All rights not expressly granted in the terms
          are expressly reserved.
        </p>
        <p>
          <strong>14.3</strong> These terms shall inure to our benefit and to
          the benefit of our agents, licensors, licensees, successors, and
          assigns.
        </p>
        <p>
          <strong>14.4</strong> All electronic communications and content
          presented and/or passed to the company, including that presented
          and/or passed from remote access connections, may be monitored, saved,
          read, transcribed, stored, or retransmitted in the course of daily
          operations by any duly authorized employee or agent of the company in
          the exercise of their duties, or by law enforcement authorities who
          may be assisting the company in investigating possible
          contravention/non-compliance with applicable laws.
        </p>
        <p>
          <strong>14.5</strong> Electronic communications and content may be
          examined by automated means.
        </p>
        <p>
          <strong>14.6</strong> Further, the company has the right to reject, at
          its sole discretion, from the web application any electronic
          communications or content deemed not to be in compliance with the
          corporate policies and procedures of the company.
        </p>
        <p>
          <strong>14.7</strong> The company shall not be under any obligation to
          furnish any clarifications or answers in the event it so rejects any
          content posted by the user.
        </p>
        <p>
          <strong>14.8</strong> However, the company has full authority to
          review the content posted by users on the web application.
        </p>

        <h2>15. Severability</h2>
        <p>
          <strong>15.1</strong> If any provision of these terms is found to be
          illegal, void or unenforceable, then that provision shall be deemed
          severable from these terms and shall not affect the validity and
          enforceability of any remaining provisions of these terms.
        </p>

        <h2>16. Waiver</h2>
        <p>
          <strong>16.1</strong> A provision of these terms may be waived only by
          a written instrument executed by the party entitled to the benefit of
          such provision.
        </p>
        <p>
          <strong>16.2</strong> The failure of company to exercise or enforce
          any right or provision of these terms will not constitute a waiver of
          such right or provision.
        </p>

        <h2>17. Notice & Attention</h2>
        <p>
          <strong>17.1</strong> Any notice or other communication to be given
          hereunder will be in writing and given by facsimile, postpaid
          registered or certified mail return receipt requested, or electronic
          mail.
        </p>

        <h2>18. No Agency</h2>
        <p>
          <strong>18.1</strong> Nothing in these terms shall be construed as
          making either party the partner, joint venture partner, agent, legal
          representative, employer, contractor or employee of the other.
        </p>
        <p>
          <strong>18.2</strong> Neither the company nor any other party to this
          terms shall have, or hold itself out to any third party as having, any
          authority to make any statements, representations or commitments of
          any kind, or to take any action that shall be binding on the other
          except as provided for herein or authorized in writing by the party to
          be bound.
        </p>

        <h2>19. Modifications & Adjustments</h2>
        <p>
          <strong>19.1</strong> URL.com may add, change or eliminate
          features, pricing, nomenclature and other aspects of the company
          products and services and make other changes at any time and these
          terms will continue to apply to the company products and services as
          modified.
        </p>
        <p>
          <strong>19.2</strong> URL.com reserve the right at any time and
          from time to time to modify or discontinue, temporarily or
          permanently, the company products and services (or any part thereof)
          with or without notice.
        </p>
        <p>
          <strong>19.3</strong> User agree that URL.com will not be liable
          to user or to any third party for any such modification, suspension,
          or discontinuance of all or any portion of the company products and
          services.
        </p>

        <h2>20. Monitoring</h2>
        <p>
          <strong>20.1</strong> All electronic communications and content
          presented and/or passed to the company, including that presented
          and/or passed from remote access connections, may be monitored, saved,
          read, transcribed, stored, or retransmitted in the course of daily
          operations by any duly authorized employee or agent of the company in
          the exercise of their duties, or by law enforcement authorities who
          may be assisting the company in investigating possible
          contravention/non-compliance with applicable laws.
        </p>
        <p>
          <strong>20.2</strong> Electronic communications and content may be
          examined by automated means.
        </p>
        <p>
          <strong>20.3</strong> Further, the company has the right to reject, at
          its sole discretion, from the web application any electronic
          communications or content deemed not to be in compliance with the
          corporate policies and procedures of the company.
        </p>
        <p>
          <strong>20.4</strong> The company shall not be under any obligation to
          furnish any clarifications or answers in the event it so rejects any
          content posted by the user.
        </p>
        <p>
          <strong>20.5</strong> However, the company has full authority to
          review the content posted by users on the web application.
        </p>

        <h2>21. Obligations of Users on Web Application</h2>
        <p>
          <strong>21.1</strong> As a user, user agree that:
        </p>
        <p>
          <strong>21.1.1</strong> The company has no obligation to monitor the
          web application or web application-related services, including any
          forum, or any materials that user or other third parties transmit or
          post on to the web application.
        </p>
        <p>
          <strong>21.1.2</strong> However, user acknowledge and agree that the
          company has the right (but not the obligation) to monitor the web
          application and web application-related services, including any forum,
          and the materials user transmit or post, to alter or remove any such
          materials (including, without limitation, any posting to the web
          application), and to disclose such materials and the circumstances
          surrounding their transmission to any third party in order to operate
          the web application properly, to protect itself, its sponsors, its
          registered users and visitors, and to comply with legal obligations or
          governmental requests.
        </p>
        <p>
          <strong>21.1.3</strong> The company reserves the right to refuse to
          post or to remove any information or materials, in whole or in part,
          that it deems in its sole discretion to be unacceptable, offensive or
          in violation of this agreement.
        </p>
        <p>
          <strong>21.1.4</strong> The company also reserves the right to
          prohibit any user who, in the company's sole discretion, violates the
          code of conduct or other terms of this agreement from using the web
          application and related services.
        </p>
        <p>
          <strong>21.1.5</strong> Such prohibition may occur without notice to
          the user.
        </p>
        <p>
          <strong>21.1.6</strong> User have read, understood, and agree to be
          bound by the pricing information (see the pricing section below)
          before using the web application or registering for a course, jobs,
          resumes.
        </p>
        <p>
          <strong>21.1.7</strong> If user are under the age of 13 (thirteen),
          user have to obtained parental or legal guardian consent before using
          the web application, or registering for a course.
        </p>
        <p>
          <strong>21.1.8</strong> User also agree that user will not do any of
          the following on or through the company products and services:
        </p>
        <p>
          <strong>21.1.8.1</strong> Like upload, post or otherwise transmit any
          unsolicited or unapproved advertising, promotional materials, junk
          mail, spam, chain letters, pyramid schemes or any other form of
          solicitation (commercial or otherwise).
        </p>
        <p>
          <strong>21.1.8.2</strong> Post any inappropriate, offensive, racist,
          hateful, sexist, sex-related, false, misleading, infringing,
          defamatory or libelous content.
        </p>
        <p>
          <strong>21.1.8.3</strong> Manipulate or interfere with the company
          products and services and reproduce, distribute, publicly display,
          publicly perform, communicate to the public, create derivative works
          from or otherwise use and exploit any submitted content or other
          content obtained from any company products and services without our
          express written permission or the permission of the company.
        </p>

        <h2>22. Privacy</h2>
        <p>
          <strong>22.1</strong> Any personal information submitted in connection
          with user use of the web application is subject to our privacy policy
          which is available at{" "}
          <Link to={ROUTES.privacy}>
            {COMPANY.siteUrl}
            {ROUTES.privacy}
          </Link>
          . The terms of which are hereby incorporated into these terms by
          reference.
        </p>
        <p>
          <strong>22.2</strong> Please review our privacy policy to understand
          our practices.
        </p>
        <p>
          <strong>22.3</strong> The user may obtain certain confidential
          information, including without limitation, technical, contractual,
          product, pricing and other valuable information that should reasonably
          be understood as confidential ("confidential information").
        </p>
        <p>
          <strong>22.4</strong> The user acknowledges and agrees to hold all
          confidential information in strict confidence.
        </p>
        <p>
          <strong>22.5</strong> Title and all interests to all confidential
          information shall be vested in the company.
        </p>
        <p>
          <strong>22.6</strong> The user’s obligations regarding confidential
          information will survive the termination of these terms of use in
          accordance with the clause on ‘termination’ below.
        </p>
        <p>
          <strong>22.7</strong> The user agrees that its obligations under this
          clause is necessary and reasonable in order to protect the company’s
          business and expressly agrees that monetary damages would be
          inadequate to compensate for any breach of any covenant or agreement
          set forth herein.
        </p>
        <p>
          <strong>22.8</strong> Accordingly, the user agrees and acknowledges
          that any such violation or threatened violation will cause irreparable
          harm and injury to the company and that, in addition to any other
          remedies that may be available, in law, equity or otherwise, the
          company shall be entitled to obtain injunctive relief against the
          threatened breach of these terms or the continuation of any such
          breach.
        </p>
        <h2>23. Prohibited</h2>
        <p>
          <strong>23.1</strong> Although the web application is accessible
          worldwide, you agree to indemnify, defend and hold us, our affiliates,
          sponsors, officers, directors, employees, agents and representatives
          harmless from and against any and all claims, damages, losses, costs
          (including reasonable attorneys' fees), or other expenses that arise
          directly or indirectly out of or from (a) your breach of this
          agreement, (b) your violation of the code of conduct, and/or (c) your
          activities in connection with the web application or web
          application-related services. In using the company products and
          services, you further agree not to:
        </p>
        <p>
          <strong>23.2</strong> Upload or otherwise transmit to or through the
          services any information or content that infringes any patent,
          copyright or other proprietary rights of any party, including by
          incorporating any such material in submitted content.
        </p>
        <p>
          <strong>23.3</strong> Upload or otherwise transmit to or through the
          services any unlawful, harmful, harassing, defamatory, threatening,
          vulgar, sexually explicit, hateful or otherwise objectionable material
          of any kind, any material that can cause harm or delay to the company
          products and services or devices of any kind.
        </p>
        <p>
          <strong>23.4</strong> Create a false identity or impersonate another
          person or entity in any way.
        </p>
        <p>
          <strong>23.5</strong> Restrict, discourage or inhibit any person from
          using the company products and services, disclose personal information
          about a third person on or through company products and services or
          obtained from company products and services without the consent of
          such person or collect information about users of the company products
          and services.
        </p>
        <p>
          <strong>23.6</strong> Undertake, cause, permit or authorize the
          modification, creation of derivative works, translation, reverse
          engineering, decompiling, disassembling or hacking of any aspect of
          the company products and services or any part thereof, or attempt to
          use or access any portion of the services other than as intended by
          company.
        </p>
        <p>
          <strong>23.7</strong> Gain unapproved access to the services, to other
          users' accounts, names or personally identifiable information, or to
          other devices or web applications connected or linked to the services.
        </p>
        <p>
          <strong>23.8</strong> Reproduce, distribute, publicly display,
          publicly perform, communicate to the public, sell, trade, resell or
          exploit any portion of the company products and services, use of the
          company products and services, access to the company products and
          services or content obtained through the company products and
          services, for any aim other than expressly permitted by these terms.
        </p>
        <p>
          <strong>23.9</strong> Framing, embedding and/or passing off submitted
          content obtained from the company products and services in such a
          manner as to present them as originating from a source other than the
          company products and services.
        </p>
        <p>
          <strong>23.10</strong> Copying, caching or reformatting any submitted
          content for commercial aims in any manner whatsoever, whether by
          copying to physical or electronic media for aims of buffering delivery
          or converting transmissions from the company products and services to
          alternative delivery formats.
        </p>
        <p>
          <strong>23.11</strong> Altering, defacing, mutilating or otherwise
          bypassing any approved software through which the company products and
          services are made available and using any service marks, design marks,
          logos, photographs or other content belonging to company or obtained
          from the company products and services.
        </p>
        <p>
          <strong>23.12</strong> Post, transmit or otherwise make available any
          virus, worm, spyware or any other device code, file or program that
          may or is intended to damage or hijack the operation of any hardware,
          software or telecommunications equipment, or any other aspect of the
          company products and services or communications equipment and devices
          connected to the company products and services.
        </p>
        <p>
          <strong>23.13</strong> Remove, disable, damage, circumvent or
          otherwise interfere with any security-related features of the company
          products and services, features that prevent or restrict the use or
          copying of any part of the company products and services or any
          content accessible on or through company products and services, or
          features that enforce limitations on the use of the company products
          and services or any content accessible on or through company products
          and services.
        </p>
        <p>
          <strong>23.14</strong> Use any scraper, spider, robot or other
          automated means of any kind to access the company products and
          services, except and solely to the extent permitted by these terms and
          the features of the company products and services, deep-link to any
          feature or content on the web application, bypass our robot exclusion
          headers or other measures url.com may use to prevent or restrict
          access to the web application or services.
        </p>
        <p>
          <strong>23.15</strong> Interfere with or disrupt the company products
          and services, networks or servers connected to the company products
          and services or violate the regulations, policies or procedures of
          such networks or servers.
        </p>
        <p>
          <strong>23.16</strong> Violate any applicable federal, state or local
          laws or regulations or these terms and assist or permit any persons in
          engaging in any of the activities described above.
        </p>

        <h2>24. Refunds</h2>
        <p>
          <strong>24.1</strong> URL.com offer users a two (2)-day,
          no-questions-asked money back guarantee on all courses not for jobs
          and resumes.
        </p>
        <p>
          <strong>24.2</strong> The refund should be claimed within 2 days of
          registration.
        </p>
        <p>
          <strong>24.3</strong> No such requests will be entertained after 2
          days. The 2-day, no questions refund policy stands null and void in
          the following scenarios: any kind of content is downloaded from
          company's learning management system. If you attend, watch more than 2
          class recordings from company's learning management system.
        </p>
        <p>
          <strong>24.4</strong> If URL.com believes that you are abusing our
          refund policy, it will be our sole discretion to suspend or
          discontinue your account and refuse or restrict any and all current or
          future use of the company products and services, without any liability
          to you.
        </p>
        <p>
          <strong>24.5</strong> Company reserves the absolute right to revise
          these terms at any point of time without prior notice to you other
          than by posting the revised terms on the web application.
        </p>
        <p>
          <strong>24.6</strong> To request a refund, please email
          {COMPANY.supportEmail}.
        </p>

        <h2>25. Reporting</h2>
        <p>
          <strong>25.1</strong> If you believe that any content made available
          on or through the company products and services has been used or
          exploited in a manner that infringes an intellectual property right
          you own or control, then please promptly send a "Notification of
          Claimed Infringement" containing the following information to the
          company address.
        </p>
        <p>
          <strong>25.2</strong> Your communication must include substantially
          the following:
        </p>
        <p>
          <strong>25.2.1</strong> A physical or electronic signature of a person
          authorized to act on behalf of the owner of the work(s) that has/have
          been allegedly infringed.
        </p>
        <p>
          <strong>25.2.2</strong> Identification of works or materials being
          infringed, or, if multiple works are covered by a single notification,
          a representative list of such works.
        </p>
        <p>
          <strong>25.2.3</strong> Identification of the specific material that
          is claimed to be infringing or to be the subject of infringing
          activity and that is to be removed or access to which is to be
          disabled, and information reasonably sufficient to permit company to
          locate the material.
        </p>
        <p>
          <strong>25.2.4</strong> Information reasonably sufficient to permit
          company to contact you, such as an address, telephone number, and, if
          available, an electronic mail address at which you may be contacted.
        </p>
        <p>
          <strong>25.2.5</strong> A statement that you have a good faith belief
          that the use of the material in the manner complained of is not
          authorized by the copyright owner, its agent, or the law and a
          statement that the information in the notification is accurate and
          under penalty of perjury, that you are authorized to act on behalf of
          the owner of an exclusive right that is allegedly infringed.
        </p>

        <h2>26. Registration and Identity Protection</h2>
        <p>
          <strong>26.1</strong> Some areas of the web application may require
          you to register with us.
        </p>
        <p>
          <strong>26.2</strong> When and if you register, you agree to:
        </p>
        <p>
          <strong>26.2.1</strong> Provide accurate, current, and complete
          information about yourself as prompted by our registration form
          (including your e-mail address).
        </p>
        <p>
          <strong>26.2.2</strong> To maintain and update your information
          (including your e-mail address) to keep it accurate, current, and
          complete.
        </p>
        <p>
          <strong>26.2.3</strong> You acknowledge that should any information
          provided by you be found to be untrue, inaccurate, not current, or
          incomplete, URL.com reserve the right to discontinue this
          agreement with you and your use of the web application.
        </p>
        <p>
          <strong>26.3</strong> As part of the registration process, your
          username will be your email address and you will be asked to select a
          password.
        </p>
        <p>
          <strong>26.4</strong> URL.com may refuse to allow you to use a
          username that impersonates someone else, may be illegal, may be
          protected by trademark or other proprietary rights law, is vulgar or
          otherwise offensive, or may cause confusion, as determined by
          URL.com in our sole discretion.
        </p>
        <p>
          <strong>26.5</strong> You will be liable for the confidentiality and
          use of your password and agree not to distribute, transfer or resell
          your use of or access to the web application to any third party.
        </p>
        <p>
          <strong>26.6</strong> If more than one individual wishes to use a
          single password belonging to a registered user, such registered user
          must request permission from the company in writing, it being
          understood that the company shall be under no obligation to approve
          any such request.
        </p>
        <p>
          <strong>26.7</strong> You are solely and entirely liable for
          maintaining the confidentiality of your username and password and
          solely and entirely liable for any and all activities that are
          conducted through your account.
        </p>
        <p>
          <strong>26.8</strong> To use certain company products and services,
          you will need to register and obtain an account, username and
          password.
        </p>
        <p>
          <strong>26.9</strong> When you register, the information you provide
          to URL.com during the registration process will help URL.com
          in offering content, customer service, and network management.
        </p>
        <p>
          <strong>26.10</strong> You are solely liable for maintaining the
          confidentiality of your account, username, and password (collectively,
          the "Account") and for all activities and liabilities associated with
          or occurring under your account.
        </p>
        <p>
          <strong>26.11</strong> You must notify URL.com (a) immediately of
          any unapproved use of your account and any other breach of security,
          and (b) ensure that you exit from your account at the end of each
          session.
        </p>
        <p>
          <strong>26.12</strong> URL.com cannot and will not be liable for
          any loss or damage arising from your failure to comply with the
          foregoing requirements or as a result of use of your account, either
          with or without your knowledge, prior to notifying URL.com of
          unapproved access to your account.
        </p>
        <p>
          <strong>26.13</strong> However, you agree that you will be liable for
          any losses incurred by URL.com or another party due to any use of
          your account, excluding only uses following your notification to
          URL.com of unapproved access to your account.
        </p>
        <p>
          <strong>26.14</strong> You may not transfer your account to any other
          person and you may not use anyone else's account at any time.
        </p>
        <p>
          <strong>26.15</strong> In cases where you have authorized or
          registered another individual, including a minor, to use your account,
          you are fully liable for (i) the online conduct of such user; (ii)
          controlling the user's access to and use of the services; and (iii)
          the consequences of any misuse.
        </p>
        <p>
          <strong>26.16</strong> For additional information on how URL.com
          use your information, please see our privacy policy.
        </p>

        <h2>27. Terminations</h2>
        <p>
          <strong>27.1</strong> URL.com may discontinue your use of the
          company products and services immediately without notice for any
          breach by you of these terms, or any of our applicable policies as
          posted on the web application from time to time or for breach of
          applicable laws.
        </p>
        <p>
          <strong>27.2</strong> Furthermore, URL.com may discontinue your
          rights to use the company products and services for any other reason
          or no reason.
        </p>
        <p>
          <strong>27.3</strong> In the event of termination or expiration of
          these terms, the following sections of these terms shall survive: all
          provisions regarding ownership of intellectual property, disclaimer,
          accreditation disclaimer, limitation of liability, dispute resolution,
          any other provisions of these terms which, by their nature, apply
          after termination, and the miscellaneous provisions below.
        </p>
        <p>
          <strong>27.4</strong> You agree that upon the termination, URL.com
          may delete all information related to you on the services and may bar
          your access to and use of the company products and services. Upon the
          termination, you will immediately destroy any downloaded or printed
          company content.
        </p>
        <p>
          <strong>27.5</strong> You are free to discontinue your use of the
          company products and services at any time. You can simply choose to
          stop visiting or using any aspect of the company products and
          services.
        </p>
        <p>
          <strong>27.6</strong> If you wish to discontinue your account on the
          web application or with the services, you may do so by sending an
          e-mail to {COMPANY.supportEmail} or using any other account termination
          functionality that may be offered through the company products and
          services.
        </p>
        <p>
          <strong>27.7</strong> IF USER WISH TO DISCONTINUE USER ACCOUNT ON THE
          WEB APPLICATION OR WITH THE SERVICES, USER MAY DO SO BY SENDING AN
          E-MAIL TO SUPPORT@URL.COM OR USING ANY OTHER ACCOUNT TERMINATION
          FUNCTIONALITY THAT MAY BE OFFERED THROUGH THE COMPANY PRODUCTS AND
          SERVICES.
        </p>
      </LegalDocument>
      <Footer />
    </>
  );
}

export default TermsAndConditions;
