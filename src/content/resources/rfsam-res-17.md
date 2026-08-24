---
id: RFSAM-RES-17
title: Recover an 802.15.4 mesh network key from a join
---
To read an encrypted 802.15.4 mesh you need the network key, and the weakness is how that key reaches a joining device. Capture a device joining (the APS Transport-Key on Zigbee; the commissioning exchange on Thread), then recover the key: zbdsniff extracts a Zigbee network key transported under the well-known default Trust Center link key `ZigBeeAlliance09`, while a Thread network key comes from weak / default / exposed commissioning credentials (PSKc, Joiner PSKd), not from breaking AES. Load the recovered key into Wireshark's protocol preferences to decrypt the capture in place. Modern S2-style ECDH key exchange resists capture-the-join.
