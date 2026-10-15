/**
 * Diagram the editor opens with: the bachelor-thesis workflow grouped into
 * embedded sub-processes (one per business stage).
 *
 * The tasks are mapped onto the task kinds the editor understands via the
 * custom `taskDefinitionKey` attribute, with the allowed roles stored (as a JSON
 * array) in `roles` and the fill-form reference in `formKey`:
 *
 * - `approve`                    — review/decision tasks returning `approved`
 * - `fill-project-fields`        — upload/fill tasks, optionally with a form
 * - `register-project-for-defense` — the student's defense registration
 * - `script`                     — scripting tasks that set a process variable
 */
export const starterDiagramXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:custom="http://example.com/bpmn/custom" id="Definitions_BachelorThesis" targetNamespace="http://example.com/flowable/project">
  <bpmn:process id="bachelorThesisProcess" name="Bachelor Thesis Process" isExecutable="true">
    <bpmn:documentation>Bachelor thesis workflow grouped into embedded sub-processes. Each sub-process is a business stage. Tasks are mapped onto approve, fill-project-fields, register-project-for-defense or script via the custom taskDefinitionKey attribute.</bpmn:documentation>

    <bpmn:startEvent id="startEvent" name="Process created" />

    <bpmn:subProcess id="initializationStage" name="Process initialization">
      <bpmn:startEvent id="initializationStart" />
      <bpmn:userTask id="initProcess" name="Init process / assign roles" custom:taskDefinitionKey="fill-project-fields" custom:roles='["admin"]' custom:formKey="initialization" />
      <bpmn:endEvent id="initializationEnd" />
      <bpmn:sequenceFlow id="initializationFlowStart" sourceRef="initializationStart" targetRef="initProcess" />
      <bpmn:sequenceFlow id="initializationFlowEnd" name="init.submit" sourceRef="initProcess" targetRef="initializationEnd" />
    </bpmn:subProcess>

    <bpmn:subProcess id="topicSelectionStage" name="Topic selection">
      <bpmn:startEvent id="topicSelectionStart" />
      <bpmn:userTask id="chooseTopic" name="Choose / upload topic" custom:taskDefinitionKey="fill-project-fields" custom:roles='["student"]' custom:formKey="topic" />
      <bpmn:userTask id="supervisorReviewTopic" name="Supervisor review topic" custom:taskDefinitionKey="approve" custom:roles='["supervisor"]' custom:decisionKey="topicSupervisorDecision" />
      <bpmn:exclusiveGateway id="topicSupervisorDecisionGateway" name="Supervisor topic decision" />
      <bpmn:userTask id="adminReviewTopic" name="Admin review topic" custom:taskDefinitionKey="approve" custom:roles='["admin"]' custom:decisionKey="topicAdminDecision" />
      <bpmn:exclusiveGateway id="topicAdminDecisionGateway" name="Admin topic decision" />
      <bpmn:endEvent id="topicSelectionEnd" />

      <bpmn:sequenceFlow id="topicFlowStart" sourceRef="topicSelectionStart" targetRef="chooseTopic" />
      <bpmn:sequenceFlow id="topicFlowUpload" name="topic.upload" sourceRef="chooseTopic" targetRef="supervisorReviewTopic" />
      <bpmn:sequenceFlow id="topicFlowSupervisorGateway" sourceRef="supervisorReviewTopic" targetRef="topicSupervisorDecisionGateway" />
      <bpmn:sequenceFlow id="topicFlowSupervisorApprove" name="topic.approve_supervisor" sourceRef="topicSupervisorDecisionGateway" targetRef="adminReviewTopic">
        <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression"><![CDATA[\${topicSupervisorDecision == 'approve'}]]></bpmn:conditionExpression>
      </bpmn:sequenceFlow>
      <bpmn:sequenceFlow id="topicFlowSupervisorReject" name="topic.reject_supervisor" sourceRef="topicSupervisorDecisionGateway" targetRef="chooseTopic">
        <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression"><![CDATA[\${topicSupervisorDecision == 'reject'}]]></bpmn:conditionExpression>
      </bpmn:sequenceFlow>
      <bpmn:sequenceFlow id="topicFlowAdminGateway" sourceRef="adminReviewTopic" targetRef="topicAdminDecisionGateway" />
      <bpmn:sequenceFlow id="topicFlowAdminApprove" name="topic.approve_admin" sourceRef="topicAdminDecisionGateway" targetRef="topicSelectionEnd">
        <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression"><![CDATA[\${topicAdminDecision == 'approve'}]]></bpmn:conditionExpression>
      </bpmn:sequenceFlow>
      <bpmn:sequenceFlow id="topicFlowAdminReject" name="topic.reject_admin" sourceRef="topicAdminDecisionGateway" targetRef="chooseTopic">
        <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression"><![CDATA[\${topicAdminDecision == 'reject'}]]></bpmn:conditionExpression>
      </bpmn:sequenceFlow>
    </bpmn:subProcess>

    <bpmn:parallelGateway id="forkAfterTopic" name="Topic approved" />

    <bpmn:subProcess id="thesisPreparationStage" name="Thesis preparation">
      <bpmn:startEvent id="thesisPreparationStart" />
      <bpmn:userTask id="uploadThesisMaterials" name="Upload thesis materials" custom:taskDefinitionKey="fill-project-fields" custom:roles='["student"]' custom:formKey="thesis-materials" />
      <bpmn:userTask id="supervisorReviewThesis" name="Supervisor review thesis" custom:taskDefinitionKey="approve" custom:roles='["supervisor"]' custom:decisionKey="designDecision" />
      <bpmn:exclusiveGateway id="thesisDecisionGateway" name="Thesis decision" />
      <bpmn:endEvent id="thesisPreparationEnd" />

      <bpmn:sequenceFlow id="thesisFlowStart" sourceRef="thesisPreparationStart" targetRef="uploadThesisMaterials" />
      <bpmn:sequenceFlow id="thesisFlowUpload" name="design.upload" sourceRef="uploadThesisMaterials" targetRef="supervisorReviewThesis" />
      <bpmn:sequenceFlow id="thesisFlowReviewGateway" sourceRef="supervisorReviewThesis" targetRef="thesisDecisionGateway" />
      <bpmn:sequenceFlow id="thesisFlowApprove" name="design.approve" sourceRef="thesisDecisionGateway" targetRef="thesisPreparationEnd">
        <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression"><![CDATA[\${designDecision == 'approve'}]]></bpmn:conditionExpression>
      </bpmn:sequenceFlow>
      <bpmn:sequenceFlow id="thesisFlowReject" name="design.reject" sourceRef="thesisDecisionGateway" targetRef="uploadThesisMaterials">
        <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression"><![CDATA[\${designDecision == 'reject'}]]></bpmn:conditionExpression>
      </bpmn:sequenceFlow>
    </bpmn:subProcess>

    <bpmn:subProcess id="internshipStage" name="Internship">
      <bpmn:startEvent id="internshipStart" />
      <bpmn:userTask id="uploadInternshipReport" name="Upload internship report" custom:taskDefinitionKey="fill-project-fields" custom:roles='["student"]' custom:formKey="internship-report" />
      <bpmn:userTask id="internshipSupervisorReview" name="Internship supervisor review" custom:taskDefinitionKey="approve" custom:roles='["internship_supervisor"]' custom:decisionKey="internshipDecision" />
      <bpmn:exclusiveGateway id="internshipDecisionGateway" name="Internship decision" />
      <bpmn:endEvent id="internshipEnd" />

      <bpmn:sequenceFlow id="internshipFlowStart" sourceRef="internshipStart" targetRef="uploadInternshipReport" />
      <bpmn:sequenceFlow id="internshipFlowUpload" name="internship.upload" sourceRef="uploadInternshipReport" targetRef="internshipSupervisorReview" />
      <bpmn:sequenceFlow id="internshipFlowReviewGateway" sourceRef="internshipSupervisorReview" targetRef="internshipDecisionGateway" />
      <bpmn:sequenceFlow id="internshipFlowApprove" name="internship.approve" sourceRef="internshipDecisionGateway" targetRef="internshipEnd">
        <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression"><![CDATA[\${internshipDecision == 'approve'}]]></bpmn:conditionExpression>
      </bpmn:sequenceFlow>
      <bpmn:sequenceFlow id="internshipFlowReject" name="internship.reject" sourceRef="internshipDecisionGateway" targetRef="uploadInternshipReport">
        <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression"><![CDATA[\${internshipDecision == 'reject'}]]></bpmn:conditionExpression>
      </bpmn:sequenceFlow>
    </bpmn:subProcess>

    <bpmn:parallelGateway id="forkAfterThesis" name="Thesis approved" />

    <bpmn:subProcess id="plagiarismStage" name="Plagiarism check">
      <bpmn:startEvent id="plagiarismStart" />
      <bpmn:userTask id="plagiarismSupervisorCheck" name="Plagiarism supervisor check" custom:taskDefinitionKey="approve" custom:roles='["plagiarism_supervisor"]' custom:decisionKey="plagiarismDecision" />
      <bpmn:exclusiveGateway id="plagiarismDecisionGateway" name="Plagiarism decision" />
      <bpmn:userTask id="fixPlagiarismIssues" name="Fix plagiarism issues" custom:taskDefinitionKey="fill-project-fields" custom:roles='["student"]' custom:formKey="plagiarism-issues" />
      <bpmn:endEvent id="plagiarismEnd" />

      <bpmn:sequenceFlow id="plagiarismFlowStart" sourceRef="plagiarismStart" targetRef="plagiarismSupervisorCheck" />
      <bpmn:sequenceFlow id="plagiarismFlowGateway" sourceRef="plagiarismSupervisorCheck" targetRef="plagiarismDecisionGateway" />
      <bpmn:sequenceFlow id="plagiarismFlowApprove" name="plagiarism.approve" sourceRef="plagiarismDecisionGateway" targetRef="plagiarismEnd">
        <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression"><![CDATA[\${plagiarismDecision == 'approve'}]]></bpmn:conditionExpression>
      </bpmn:sequenceFlow>
      <bpmn:sequenceFlow id="plagiarismFlowReject" name="plagiarism.reject" sourceRef="plagiarismDecisionGateway" targetRef="fixPlagiarismIssues">
        <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression"><![CDATA[\${plagiarismDecision == 'reject'}]]></bpmn:conditionExpression>
      </bpmn:sequenceFlow>
      <bpmn:sequenceFlow id="plagiarismFlowFix" name="plagiarism.upload" sourceRef="fixPlagiarismIssues" targetRef="plagiarismSupervisorCheck" />
    </bpmn:subProcess>

    <bpmn:subProcess id="defenseRegistrationStage" name="Defense registration">
      <bpmn:startEvent id="defenseRegistrationStart" />
      <bpmn:userTask id="studentRegisterDefense" name="Manage defense registration" custom:taskDefinitionKey="register-project-for-defense" custom:roles='["student"]' />
      <bpmn:sequenceFlow id="registrationFlowStart" sourceRef="defenseRegistrationStart" targetRef="studentRegisterDefense" />
      <bpmn:sequenceFlow id="registrationFlowRepeat" name="Keep open for edits" sourceRef="studentRegisterDefense" targetRef="studentRegisterDefense" />
    </bpmn:subProcess>

    <bpmn:boundaryEvent id="registrationClosedBoundary" name="Closed and registered" attachedToRef="defenseRegistrationStage" cancelActivity="true">
      <bpmn:conditionalEventDefinition>
        <bpmn:condition xsi:type="bpmn:tFormalExpression"><![CDATA[\${registrationClosed == true && defenseRegistered == true}]]></bpmn:condition>
      </bpmn:conditionalEventDefinition>
    </bpmn:boundaryEvent>

    <bpmn:parallelGateway id="joinPlagiarismInternship" name="Plagiarism and internship complete" />

    <bpmn:subProcess id="preDefenseStage" name="Pre-defense">
      <bpmn:startEvent id="preDefenseStart" />
      <bpmn:userTask id="commissionReviewPreDefense" name="Commission pre-defense review" custom:taskDefinitionKey="approve" custom:roles='["commission_member"]' custom:decisionKey="preDefenseDecision" />
      <bpmn:exclusiveGateway id="preDefenseDecisionGateway" name="Pre-defense decision" />
      <bpmn:userTask id="fixPreDefenseIssues" name="Fix pre-defense issues" custom:taskDefinitionKey="fill-project-fields" custom:roles='["student"]' custom:formKey="pre-defense-issues" />
      <bpmn:endEvent id="preDefenseEnd" />

      <bpmn:sequenceFlow id="preDefenseFlowStart" sourceRef="preDefenseStart" targetRef="commissionReviewPreDefense" />
      <bpmn:sequenceFlow id="preDefenseFlowGateway" sourceRef="commissionReviewPreDefense" targetRef="preDefenseDecisionGateway" />
      <bpmn:sequenceFlow id="preDefenseFlowApprove" name="pre_defense.approve" sourceRef="preDefenseDecisionGateway" targetRef="preDefenseEnd">
        <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression"><![CDATA[\${preDefenseDecision == 'approve'}]]></bpmn:conditionExpression>
      </bpmn:sequenceFlow>
      <bpmn:sequenceFlow id="preDefenseFlowReject" name="pre_defense.reject" sourceRef="preDefenseDecisionGateway" targetRef="fixPreDefenseIssues">
        <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression"><![CDATA[\${preDefenseDecision == 'reject'}]]></bpmn:conditionExpression>
      </bpmn:sequenceFlow>
      <bpmn:sequenceFlow id="preDefenseFlowFix" name="pre_defense.upload" sourceRef="fixPreDefenseIssues" targetRef="commissionReviewPreDefense" />
    </bpmn:subProcess>

    <bpmn:subProcess id="reviewStage" name="Reviewer report">
      <bpmn:startEvent id="reviewStart" />
      <bpmn:userTask id="reviewerUploadReport" name="Upload review report" custom:taskDefinitionKey="fill-project-fields" custom:roles='["reviewer"]' custom:formKey="review-report" />
      <bpmn:endEvent id="reviewEnd" />
      <bpmn:sequenceFlow id="reviewFlowStart" sourceRef="reviewStart" targetRef="reviewerUploadReport" />
      <bpmn:sequenceFlow id="reviewFlowSubmit" name="review.submit" sourceRef="reviewerUploadReport" targetRef="reviewEnd" />
    </bpmn:subProcess>

    <bpmn:scriptTask id="closeRegistration" name="Set defense registration closed" custom:taskDefinitionKey="script" custom:expressions='[{"kind":"set-variable","name":"registrationClosed","value":"true"}]' />

    <bpmn:parallelGateway id="joinReviewRegistration" name="Review and registration complete" />

    <bpmn:subProcess id="defenseStage" name="Final defense">
      <bpmn:startEvent id="defenseStart" />
      <bpmn:userTask id="supervisorAddGrade" name="Record thesis defense grade" custom:taskDefinitionKey="fill-project-fields" custom:roles='["supervisor"]' custom:formKey="grade" />
      <bpmn:endEvent id="defenseEnd" />
      <bpmn:sequenceFlow id="defenseFlowStart" sourceRef="defenseStart" targetRef="supervisorAddGrade" />
      <bpmn:sequenceFlow id="defenseFlowSubmit" name="thesis_defense.submit" sourceRef="supervisorAddGrade" targetRef="defenseEnd" />
    </bpmn:subProcess>

    <bpmn:endEvent id="endEvent" name="Process finished" />

    <bpmn:sequenceFlow id="flowStartInitialization" sourceRef="startEvent" targetRef="initializationStage" />
    <bpmn:sequenceFlow id="flowInitializationTopic" sourceRef="initializationStage" targetRef="topicSelectionStage" />
    <bpmn:sequenceFlow id="flowTopicFork" sourceRef="topicSelectionStage" targetRef="forkAfterTopic" />
    <bpmn:sequenceFlow id="flowForkTopicThesis" sourceRef="forkAfterTopic" targetRef="thesisPreparationStage" />
    <bpmn:sequenceFlow id="flowForkTopicInternship" sourceRef="forkAfterTopic" targetRef="internshipStage" />
    <bpmn:sequenceFlow id="flowThesisFork" sourceRef="thesisPreparationStage" targetRef="forkAfterThesis" />
    <bpmn:sequenceFlow id="flowForkThesisPlagiarism" sourceRef="forkAfterThesis" targetRef="plagiarismStage" />
    <bpmn:sequenceFlow id="flowForkThesisRegistration" sourceRef="forkAfterThesis" targetRef="defenseRegistrationStage" />
    <bpmn:sequenceFlow id="flowPlagiarismJoin" sourceRef="plagiarismStage" targetRef="joinPlagiarismInternship" />
    <bpmn:sequenceFlow id="flowInternshipJoin" sourceRef="internshipStage" targetRef="joinPlagiarismInternship" />
    <bpmn:sequenceFlow id="flowJoinPreDefense" sourceRef="joinPlagiarismInternship" targetRef="preDefenseStage" />
    <bpmn:sequenceFlow id="flowPreDefenseReview" sourceRef="preDefenseStage" targetRef="reviewStage" />
    <bpmn:sequenceFlow id="flowReviewJoin" sourceRef="reviewStage" targetRef="closeRegistration" />
    <bpmn:sequenceFlow id="flowCloseJoin" sourceRef="closeRegistration" targetRef="joinReviewRegistration" />
    <bpmn:sequenceFlow id="flowBoundaryJoin" sourceRef="registrationClosedBoundary" targetRef="joinReviewRegistration" />
    <bpmn:sequenceFlow id="flowJoinDefense" sourceRef="joinReviewRegistration" targetRef="defenseStage" />
    <bpmn:sequenceFlow id="flowDefenseEnd" sourceRef="defenseStage" targetRef="endEvent" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="bachelorThesisProcessDiagram">
    <bpmndi:BPMNPlane id="bachelorThesisProcessPlane" bpmnElement="bachelorThesisProcess">
      <bpmndi:BPMNShape id="startEvent_di" bpmnElement="startEvent"><dc:Bounds x="30" y="390" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="initializationStage_di" bpmnElement="initializationStage" isExpanded="true"><dc:Bounds x="100" y="320" width="500" height="180"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="topicSelectionStage_di" bpmnElement="topicSelectionStage" isExpanded="true"><dc:Bounds x="650" y="250" width="1150" height="320"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="forkAfterTopic_di" bpmnElement="forkAfterTopic" isMarkerVisible="true"><dc:Bounds x="1840" y="385" width="50" height="50"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="thesisPreparationStage_di" bpmnElement="thesisPreparationStage" isExpanded="true"><dc:Bounds x="1940" y="80" width="900" height="280"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="internshipStage_di" bpmnElement="internshipStage" isExpanded="true"><dc:Bounds x="1940" y="500" width="900" height="280"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="forkAfterThesis_di" bpmnElement="forkAfterThesis" isMarkerVisible="true"><dc:Bounds x="2890" y="195" width="50" height="50"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="plagiarismStage_di" bpmnElement="plagiarismStage" isExpanded="true"><dc:Bounds x="2990" y="40" width="900" height="300"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="defenseRegistrationStage_di" bpmnElement="defenseRegistrationStage" isExpanded="true"><dc:Bounds x="2990" y="500" width="900" height="300"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="joinPlagiarismInternship_di" bpmnElement="joinPlagiarismInternship" isMarkerVisible="true"><dc:Bounds x="3940" y="385" width="50" height="50"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="preDefenseStage_di" bpmnElement="preDefenseStage" isExpanded="true"><dc:Bounds x="4040" y="250" width="950" height="320"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="reviewStage_di" bpmnElement="reviewStage" isExpanded="true"><dc:Bounds x="5040" y="320" width="520" height="180"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="closeRegistration_di" bpmnElement="closeRegistration"><dc:Bounds x="5600" y="370" width="150" height="80"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="joinReviewRegistration_di" bpmnElement="joinReviewRegistration" isMarkerVisible="true"><dc:Bounds x="5820" y="385" width="50" height="50"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="defenseStage_di" bpmnElement="defenseStage" isExpanded="true"><dc:Bounds x="5920" y="320" width="520" height="180"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="endEvent_di" bpmnElement="endEvent"><dc:Bounds x="6500" y="390" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="initializationStart_di" bpmnElement="initializationStart"><dc:Bounds x="130" y="392" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="initProcess_di" bpmnElement="initProcess"><dc:Bounds x="220" y="370" width="220" height="80"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="initializationEnd_di" bpmnElement="initializationEnd"><dc:Bounds x="520" y="392" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="initializationFlowStart_di" bpmnElement="initializationFlowStart"><di:waypoint x="166" y="410.0"/><di:waypoint x="220" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="initializationFlowEnd_di" bpmnElement="initializationFlowEnd"><di:waypoint x="440" y="410.0"/><di:waypoint x="520" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="topicSelectionStart_di" bpmnElement="topicSelectionStart"><dc:Bounds x="680" y="392" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="chooseTopic_di" bpmnElement="chooseTopic"><dc:Bounds x="760" y="370" width="170" height="80"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="supervisorReviewTopic_di" bpmnElement="supervisorReviewTopic"><dc:Bounds x="980" y="370" width="190" height="80"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="topicSupervisorDecisionGateway_di" bpmnElement="topicSupervisorDecisionGateway" isMarkerVisible="true"><dc:Bounds x="1210" y="385" width="50" height="50"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="adminReviewTopic_di" bpmnElement="adminReviewTopic"><dc:Bounds x="1310" y="370" width="170" height="80"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="topicAdminDecisionGateway_di" bpmnElement="topicAdminDecisionGateway" isMarkerVisible="true"><dc:Bounds x="1520" y="385" width="50" height="50"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="topicSelectionEnd_di" bpmnElement="topicSelectionEnd"><dc:Bounds x="1720" y="392" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="topicFlowStart_di" bpmnElement="topicFlowStart"><di:waypoint x="716" y="410.0"/><di:waypoint x="760" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="topicFlowUpload_di" bpmnElement="topicFlowUpload"><di:waypoint x="930" y="410.0"/><di:waypoint x="980" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="topicFlowSupervisorGateway_di" bpmnElement="topicFlowSupervisorGateway"><di:waypoint x="1170" y="410.0"/><di:waypoint x="1210" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="topicFlowSupervisorApprove_di" bpmnElement="topicFlowSupervisorApprove"><di:waypoint x="1260" y="410.0"/><di:waypoint x="1310" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="topicFlowAdminGateway_di" bpmnElement="topicFlowAdminGateway"><di:waypoint x="1480" y="410.0"/><di:waypoint x="1520" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="topicFlowAdminApprove_di" bpmnElement="topicFlowAdminApprove"><di:waypoint x="1570" y="410.0"/><di:waypoint x="1720" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="topicFlowSupervisorReject_di" bpmnElement="topicFlowSupervisorReject"><di:waypoint x="1235.0" y="435"/><di:waypoint x="1235" y="505"/><di:waypoint x="845" y="505"/><di:waypoint x="845.0" y="450"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="topicFlowAdminReject_di" bpmnElement="topicFlowAdminReject"><di:waypoint x="1545.0" y="435"/><di:waypoint x="1545" y="535"/><di:waypoint x="845" y="535"/><di:waypoint x="845.0" y="450"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="thesisPreparationStart_di" bpmnElement="thesisPreparationStart"><dc:Bounds x="1970" y="192" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="uploadThesisMaterials_di" bpmnElement="uploadThesisMaterials"><dc:Bounds x="2050" y="170" width="190" height="80"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="supervisorReviewThesis_di" bpmnElement="supervisorReviewThesis"><dc:Bounds x="2290" y="170" width="190" height="80"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="thesisDecisionGateway_di" bpmnElement="thesisDecisionGateway" isMarkerVisible="true"><dc:Bounds x="2530" y="185" width="50" height="50"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="thesisPreparationEnd_di" bpmnElement="thesisPreparationEnd"><dc:Bounds x="2760" y="192" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="thesisFlowStart_di" bpmnElement="thesisFlowStart"><di:waypoint x="2006" y="210.0"/><di:waypoint x="2050" y="210.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="thesisFlowUpload_di" bpmnElement="thesisFlowUpload"><di:waypoint x="2240" y="210.0"/><di:waypoint x="2290" y="210.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="thesisFlowReviewGateway_di" bpmnElement="thesisFlowReviewGateway"><di:waypoint x="2480" y="210.0"/><di:waypoint x="2530" y="210.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="thesisFlowApprove_di" bpmnElement="thesisFlowApprove"><di:waypoint x="2580" y="210.0"/><di:waypoint x="2760" y="210.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="thesisFlowReject_di" bpmnElement="thesisFlowReject"><di:waypoint x="2555.0" y="235"/><di:waypoint x="2555" y="310"/><di:waypoint x="2145" y="310"/><di:waypoint x="2145.0" y="250"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="internshipStart_di" bpmnElement="internshipStart"><dc:Bounds x="1970" y="612" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="uploadInternshipReport_di" bpmnElement="uploadInternshipReport"><dc:Bounds x="2050" y="590" width="190" height="80"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="internshipSupervisorReview_di" bpmnElement="internshipSupervisorReview"><dc:Bounds x="2290" y="590" width="200" height="80"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="internshipDecisionGateway_di" bpmnElement="internshipDecisionGateway" isMarkerVisible="true"><dc:Bounds x="2540" y="605" width="50" height="50"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="internshipEnd_di" bpmnElement="internshipEnd"><dc:Bounds x="2760" y="612" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="internshipFlowStart_di" bpmnElement="internshipFlowStart"><di:waypoint x="2006" y="630.0"/><di:waypoint x="2050" y="630.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="internshipFlowUpload_di" bpmnElement="internshipFlowUpload"><di:waypoint x="2240" y="630.0"/><di:waypoint x="2290" y="630.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="internshipFlowReviewGateway_di" bpmnElement="internshipFlowReviewGateway"><di:waypoint x="2490" y="630.0"/><di:waypoint x="2540" y="630.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="internshipFlowApprove_di" bpmnElement="internshipFlowApprove"><di:waypoint x="2590" y="630.0"/><di:waypoint x="2760" y="630.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="internshipFlowReject_di" bpmnElement="internshipFlowReject"><di:waypoint x="2565.0" y="655"/><di:waypoint x="2565" y="730"/><di:waypoint x="2145" y="730"/><di:waypoint x="2145.0" y="670"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="plagiarismStart_di" bpmnElement="plagiarismStart"><dc:Bounds x="3020" y="162" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="plagiarismSupervisorCheck_di" bpmnElement="plagiarismSupervisorCheck"><dc:Bounds x="3100" y="140" width="200" height="80"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="plagiarismDecisionGateway_di" bpmnElement="plagiarismDecisionGateway" isMarkerVisible="true"><dc:Bounds x="3350" y="155" width="50" height="50"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="plagiarismEnd_di" bpmnElement="plagiarismEnd"><dc:Bounds x="3800" y="162" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="fixPlagiarismIssues_di" bpmnElement="fixPlagiarismIssues"><dc:Bounds x="3350" y="240" width="200" height="70"/></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="plagiarismFlowStart_di" bpmnElement="plagiarismFlowStart"><di:waypoint x="3056" y="180.0"/><di:waypoint x="3100" y="180.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="plagiarismFlowGateway_di" bpmnElement="plagiarismFlowGateway"><di:waypoint x="3300" y="180.0"/><di:waypoint x="3350" y="180.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="plagiarismFlowApprove_di" bpmnElement="plagiarismFlowApprove"><di:waypoint x="3400" y="180.0"/><di:waypoint x="3800" y="180.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="plagiarismFlowReject_di" bpmnElement="plagiarismFlowReject"><di:waypoint x="3375.0" y="205"/><di:waypoint x="3375" y="240"/><di:waypoint x="3350" y="275.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="plagiarismFlowFix_di" bpmnElement="plagiarismFlowFix"><di:waypoint x="3350" y="275.0"/><di:waypoint x="3070" y="275"/><di:waypoint x="3070" y="180"/><di:waypoint x="3100" y="180.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="defenseRegistrationStart_di" bpmnElement="defenseRegistrationStart"><dc:Bounds x="3020" y="622" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="studentRegisterDefense_di" bpmnElement="studentRegisterDefense"><dc:Bounds x="3100" y="600" width="190" height="80"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="registrationClosedBoundary_di" bpmnElement="registrationClosedBoundary"><dc:Bounds x="3177" y="782" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="registrationFlowStart_di" bpmnElement="registrationFlowStart"><di:waypoint x="3056" y="640.0"/><di:waypoint x="3100" y="640.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="registrationFlowRepeat_di" bpmnElement="registrationFlowRepeat"><di:waypoint x="3150" y="680.0"/><di:waypoint x="3150" y="716.0"/><di:waypoint x="3240" y="716.0"/><di:waypoint x="3240" y="680.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="preDefenseStart_di" bpmnElement="preDefenseStart"><dc:Bounds x="4070" y="392" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="commissionReviewPreDefense_di" bpmnElement="commissionReviewPreDefense"><dc:Bounds x="4150" y="370" width="210" height="80"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="preDefenseDecisionGateway_di" bpmnElement="preDefenseDecisionGateway" isMarkerVisible="true"><dc:Bounds x="4410" y="385" width="50" height="50"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="preDefenseEnd_di" bpmnElement="preDefenseEnd"><dc:Bounds x="4900" y="392" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="fixPreDefenseIssues_di" bpmnElement="fixPreDefenseIssues"><dc:Bounds x="4410" y="480" width="200" height="70"/></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="preDefenseFlowStart_di" bpmnElement="preDefenseFlowStart"><di:waypoint x="4106" y="410.0"/><di:waypoint x="4150" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="preDefenseFlowGateway_di" bpmnElement="preDefenseFlowGateway"><di:waypoint x="4360" y="410.0"/><di:waypoint x="4410" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="preDefenseFlowApprove_di" bpmnElement="preDefenseFlowApprove"><di:waypoint x="4460" y="410.0"/><di:waypoint x="4900" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="preDefenseFlowReject_di" bpmnElement="preDefenseFlowReject"><di:waypoint x="4435.0" y="435"/><di:waypoint x="4435" y="480"/><di:waypoint x="4410" y="515.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="preDefenseFlowFix_di" bpmnElement="preDefenseFlowFix"><di:waypoint x="4410" y="515.0"/><di:waypoint x="4120" y="515"/><di:waypoint x="4120" y="410"/><di:waypoint x="4150" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="reviewStart_di" bpmnElement="reviewStart"><dc:Bounds x="5070" y="392" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="reviewerUploadReport_di" bpmnElement="reviewerUploadReport"><dc:Bounds x="5150" y="370" width="220" height="80"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="reviewEnd_di" bpmnElement="reviewEnd"><dc:Bounds x="5480" y="392" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="reviewFlowStart_di" bpmnElement="reviewFlowStart"><di:waypoint x="5106" y="410.0"/><di:waypoint x="5150" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="reviewFlowSubmit_di" bpmnElement="reviewFlowSubmit"><di:waypoint x="5370" y="410.0"/><di:waypoint x="5480" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="defenseStart_di" bpmnElement="defenseStart"><dc:Bounds x="5890" y="392" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="supervisorAddGrade_di" bpmnElement="supervisorAddGrade"><dc:Bounds x="5970" y="370" width="220" height="80"/></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="defenseEnd_di" bpmnElement="defenseEnd"><dc:Bounds x="6250" y="392" width="36" height="36"/></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="defenseFlowStart_di" bpmnElement="defenseFlowStart"><di:waypoint x="5926" y="410.0"/><di:waypoint x="5970" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="defenseFlowSubmit_di" bpmnElement="defenseFlowSubmit"><di:waypoint x="6190" y="410.0"/><di:waypoint x="6250" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flowStartInitialization_di" bpmnElement="flowStartInitialization"><di:waypoint x="66" y="408.0"/><di:waypoint x="100" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flowInitializationTopic_di" bpmnElement="flowInitializationTopic"><di:waypoint x="600" y="410.0"/><di:waypoint x="650" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flowTopicFork_di" bpmnElement="flowTopicFork"><di:waypoint x="1800" y="410.0"/><di:waypoint x="1840" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flowForkTopicThesis_di" bpmnElement="flowForkTopicThesis"><di:waypoint x="1865.0" y="385"/><di:waypoint x="1865" y="220"/><di:waypoint x="1940" y="220"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flowForkTopicInternship_di" bpmnElement="flowForkTopicInternship"><di:waypoint x="1865.0" y="435"/><di:waypoint x="1865" y="640"/><di:waypoint x="1940" y="640"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flowThesisFork_di" bpmnElement="flowThesisFork"><di:waypoint x="2840" y="220.0"/><di:waypoint x="2890" y="220.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flowForkThesisPlagiarism_di" bpmnElement="flowForkThesisPlagiarism"><di:waypoint x="2915.0" y="195"/><di:waypoint x="2915" y="190"/><di:waypoint x="2990" y="190"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flowForkThesisRegistration_di" bpmnElement="flowForkThesisRegistration"><di:waypoint x="2915.0" y="245"/><di:waypoint x="2915" y="640"/><di:waypoint x="2990" y="640"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flowPlagiarismJoin_di" bpmnElement="flowPlagiarismJoin"><di:waypoint x="3890" y="190.0"/><di:waypoint x="3915" y="190"/><di:waypoint x="3915" y="410"/><di:waypoint x="3940" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flowInternshipJoin_di" bpmnElement="flowInternshipJoin"><di:waypoint x="2840" y="640.0"/><di:waypoint x="3915" y="640"/><di:waypoint x="3915" y="410"/><di:waypoint x="3940" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flowJoinPreDefense_di" bpmnElement="flowJoinPreDefense"><di:waypoint x="3990" y="410.0"/><di:waypoint x="4040" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flowPreDefenseReview_di" bpmnElement="flowPreDefenseReview"><di:waypoint x="4990" y="410.0"/><di:waypoint x="5040" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flowReviewJoin_di" bpmnElement="flowReviewJoin"><di:waypoint x="5560" y="410.0"/><di:waypoint x="5600" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flowCloseJoin_di" bpmnElement="flowCloseJoin"><di:waypoint x="5750" y="410.0"/><di:waypoint x="5820" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flowBoundaryJoin_di" bpmnElement="flowBoundaryJoin"><di:waypoint x="3195" y="818.0"/><di:waypoint x="3195" y="880"/><di:waypoint x="5845" y="880"/><di:waypoint x="5845" y="435"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flowJoinDefense_di" bpmnElement="flowJoinDefense"><di:waypoint x="5870" y="410.0"/><di:waypoint x="5920" y="410.0"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="flowDefenseEnd_di" bpmnElement="flowDefenseEnd"><di:waypoint x="6440" y="410.0"/><di:waypoint x="6500" y="408.0"/></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
