/**
 * Diagram the editor opens with. Replace `starterDiagramXml` with a
 * `saveXML` payload once the process definitions are loaded from the API.
 */
export const starterDiagramXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_Diploma_Process" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_Diploma" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Student applies">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="Task_Review" name="Supervisor reviews topic">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_Approved" name="Topic approved?">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:sendTask id="Task_Reject" name="Notify supervisor">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:sendTask>
    <bpmn:endEvent id="EndEvent_Rejected" name="Rejected">
      <bpmn:incoming>Flow_5</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:subProcess id="SubProcess_Work" name="Research and implementation">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:subProcess>
    <bpmn:exclusiveGateway id="Gateway_Defended" name="Defence passed?">
      <bpmn:incoming>Flow_6</bpmn:incoming>
      <bpmn:outgoing>Flow_7</bpmn:outgoing>
      <bpmn:outgoing>Flow_8</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:serviceTask id="Task_Archive" name="Archive thesis">
      <bpmn:incoming>Flow_8</bpmn:incoming>
      <bpmn:outgoing>Flow_9</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:endEvent id="EndEvent_Completed" name="Completed">
      <bpmn:incoming>Flow_9</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_Review" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_Review" targetRef="Gateway_Approved" />
    <bpmn:sequenceFlow id="Flow_3" name="no" sourceRef="Gateway_Approved" targetRef="Task_Reject" />
    <bpmn:sequenceFlow id="Flow_4" name="yes" sourceRef="Gateway_Approved" targetRef="SubProcess_Work" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_Reject" targetRef="EndEvent_Rejected" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="SubProcess_Work" targetRef="Gateway_Defended" />
    <bpmn:sequenceFlow id="Flow_7" name="yes" sourceRef="Gateway_Defended" targetRef="EndEvent_Completed" />
    <bpmn:sequenceFlow id="Flow_8" name="no" sourceRef="Gateway_Defended" targetRef="Task_Archive" />
    <bpmn:sequenceFlow id="Flow_9" sourceRef="Task_Archive" targetRef="EndEvent_Completed" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_Diploma">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="180" y="200" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Review_di" bpmnElement="Task_Review">
        <dc:Bounds x="290" y="178" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Approved_di" bpmnElement="Gateway_Approved">
        <dc:Bounds x="455" y="193" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Reject_di" bpmnElement="Task_Reject">
        <dc:Bounds x="575" y="90" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_Rejected_di" bpmnElement="EndEvent_Rejected">
        <dc:Bounds x="745" y="112" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="SubProcess_Work_di" bpmnElement="SubProcess_Work" isExpanded="true">
        <dc:Bounds x="575" y="250" width="300" height="180" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Defended_di" bpmnElement="Gateway_Defended">
        <dc:Bounds x="945" y="315" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Archive_di" bpmnElement="Task_Archive">
        <dc:Bounds x="1065" y="300" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_Completed_di" bpmnElement="EndEvent_Completed">
        <dc:Bounds x="1235" y="322" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="216" y="218" />
        <di:waypoint x="290" y="218" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="390" y="218" />
        <di:waypoint x="455" y="218" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <di:waypoint x="480" y="193" />
        <di:waypoint x="480" y="130" />
        <di:waypoint x="625" y="130" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
        <di:waypoint x="480" y="243" />
        <di:waypoint x="480" y="340" />
        <di:waypoint x="625" y="340" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5">
        <di:waypoint x="675" y="130" />
        <di:waypoint x="763" y="130" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_6_di" bpmnElement="Flow_6">
        <di:waypoint x="875" y="340" />
        <di:waypoint x="945" y="340" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_7_di" bpmnElement="Flow_7">
        <di:waypoint x="995" y="340" />
        <di:waypoint x="1010" y="340" />
        <di:waypoint x="1010" y="340" />
        <di:waypoint x="1253" y="340" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_8_di" bpmnElement="Flow_8">
        <di:waypoint x="970" y="365" />
        <di:waypoint x="970" y="340" />
        <di:waypoint x="1115" y="340" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_9_di" bpmnElement="Flow_9">
        <di:waypoint x="1165" y="340" />
        <di:waypoint x="1235" y="340" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
