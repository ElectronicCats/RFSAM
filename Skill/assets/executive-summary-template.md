# Executive Summary - Radio Frequency Security Audit - {{TARGET}}

> Template for the **executive summary** of an RFSAM audit, aimed at sponsors and
> non-technical committees. **No commands, no CVSS vectors, no control IDs.** The agent
> translates findings from the technical report (`assets/report-template.md`) into
> business risk, impact and remediation priorities. Replace the `{{...}}` placeholders
> with clear, concrete language. Target length: **1-2 pages**. If it exceeds that, trim
> detail and move it to an appendix in the technical report.

**Delivery date**: {{ISO}}
**Prepared for**: {{name/title of sponsor or committee}}
**Prepared by**: {{name/role of auditor}}
**Classification**: {{Confidential / Internal / Public}}
**Associated technical report**: `{{path to rfsam-report-<target>.md}}`

---

## 1. Context in one sentence

{{One or two sentences: what radio frequency system or environment was assessed, why
it matters to the business and under what engagement it was performed. E.g.: "The
wireless exposure of manufacturing plant X was reviewed to confirm that control
communications and mobile devices do not allow unauthorized access."}}

## 2. Main conclusion

{{Executive verdict in 2-3 lines: overall risk level and the single takeaway the reader
should come away with. E.g.: "The environment presents **high** wireless risks
concentrated in 3 critical findings. They are closable in under 90 days with coordinated
actions from device vendors and the operations team."}}

**Overall risk**: {{Critical / High / Medium / Low}}

---

## 3. Findings in figures

| Risk level | Count | What it means in practice |
|------------|-------|---------------------------|
| **Critical** | {{c}} | Exploitable today; can compromise operations, data or physical safety |
| **High** | {{h}} | Exploitable with effort or under specific conditions; serious impact if it occurs |
| **Medium** | {{m}} | Requires favorable access or combinations; limited or localized impact |
| **Low / Informational** | {{l}} | Hardening recommended; no immediate exposure |

> Total confirmed findings: **{{N}}**. Additionally **{{nh}}** are documented as verifiable
> hypotheses that require further testing in a controlled environment before being confirmed.

---

## 4. Risks requiring immediate attention

> One block per **critical or high** finding. Maximum 5-7 items; if there are more,
> group by theme. For each: **what happens** (without jargon), **what it affects**
> (business/operations/compliance/security) and **how easy it is to exploit**.
> Do not include how to exploit it or technical steps.

### Risk 1 - {{short, business-oriented title}}
- **What we observed**: {{plain-language description. E.g.: "Anyone with commercially
  available equipment can spoof the signal from the sensors and send false readings to
  the central system."}}
- **Impact if it materializes**: {{operational / financial / safety /
  regulatory / reputational. E.g.: "Automated decisions made on falsified data; possible
  line stoppage and quality rejections."}}
- **Likelihood of occurrence**: {{High / Medium / Low}} - {{brief reason:
  publicly available tools / requires physical proximity / requires specialized
  knowledge}}.
- **Remediation priority**: {{Immediate / 30 days / 90 days}}.

{{... more risks in priority order ...}}

---

## 5. What is working well

{{2-4 short bullets about controls, layers or practices that do work and that the audit
confirmed as robust. This balances the message and indicates where NOT to intervene.
E.g.: "Corporate Wi-Fi network encryption uses current standards and showed no weaknesses;
LoRa devices use unique keys per node and are not clonable."}}

---

## 6. Recommended action plan

| Priority | Risk to close | Main action (no technical detail) | Suggested owner | Estimated effort | Deadline |
|----------|---------------|-----------------------------------|-----------------|------------------|----------|
| 1 | {{Risk 1}} | {{business action, e.g.: "Coordinate with the sensor vendor to change the authentication mechanism."}} | {{Operations / IT / Vendor}} | {{Low/Medium/High}} | {{immediate / 30d / 90d}} |
| 2 | {{Risk 2}} | {{...}} | {{...}} | {{...}} | {{...}} |
| 3 | {{...}} | {{...}} | {{...}} | {{...}} | {{...}} |

> **Critical and high** findings require coordinated action at three levels: the device/
> firmware **manufacturer**, the **integrator** who deploys and configures, and the
> **operator** who monitors and responds. **Low or informational** findings may be closed
> with operator actions alone.

---

## 7. Scope and confidence

- **What we covered**: {{protocols and devices assessed, mode of operation:
  passive listening only / authorized active testing / lab environment}}.
- **What we did NOT cover**: {{out-of-scope protocols or devices; time windows or bands
  not observed; devices that were not operational during the audit}}.
- **Confidence**: **confirmed** findings are backed by reproducible evidence. Those marked
  as **hypotheses** require additional verification before being treated as confirmed.
- **Applicable compliance**: {{if applicable, mention relevant frameworks - ISO 27001,
  IEC 62443, PCI-DSS, local spectrum regulation - and whether the audit provides evidence
  for or against}}.

---

## 8. Suggested next steps

1. **Validate priorities** with the technical and business teams (1-hour meeting).
2. **Begin closure** of critical findings within the agreed window.
3. **Re-audit** after applying remediation to confirm effective closure.
4. **Establish a cadence** for wireless surface review (semi-annually or upon relevant
   changes to the device fleet).

---

_Executive summary generated following RFSAM (CC BY-SA 4.0). Full technical detail,
commands, evidence and control mapping are in the associated technical report. For
technical questions, contact the auditor; for business decisions, the sponsor._
