---
id: RFSAM-RES-20
title: GNSS spoofing / jamming resilience test (authorised)
---
AUTHORISED, RF-shielded / conducted testing only, never radiate GNSS over the air. Generate a synthetic GNSS scenario (e.g. with gps-sdr-sim) and transmit it on a TX-capable SDR (HackRF / bladeRF / USRP) into a shielded enclosure or a cabled setup, then observe whether the receiver under test locks onto the false position, follows a slow position / time pull-off from the genuine fix, or detects and rejects the attack. Test jamming resilience separately with a controlled in-band noise source. Assess any anti-spoofing the receiver claims (RAIM, signal-authentication, multi-constellation cross-checks).
