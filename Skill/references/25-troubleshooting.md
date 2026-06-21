# 25 — Troubleshooting RF

> Diagnóstico cuando una fase del descenso no progresa. Úsalo **antes** de declarar gap (Ruta A) o escalar
> (CONSULTA): la mayoría de los "no funciona" son entorno (permisos/drivers/antena), no falta de señal ni
> fortaleza de cripto. Fuente: §1 (setup), §2 (diagnóstico), §3 (orden de diagnosis), §4 (falsos positivos).

## Índice
1. §setup — 5 checks de entorno (Fase 0, cachea resultado en `loot/notes/hardware.txt`)
2. §diagnostico — tabla síntoma → causa probable → acción
3. §orden — regla de diagnosis (antena antes que driver antes que binario)
4. §falsos-positivos — hallazgo que parece confirmado pero no lo es

---

## 1. §setup — 5 checks de entorno (Fase 0)

Un comando por check, sin dependencias externas. El resultado se cachea en `loot/notes/hardware.txt`
(re-lectura en cada eje 4 del árbol de decisión, no se re-corre por comando salvo TX).

### 1.1 Software host

```sh
for t in gqrx wireshark hackrf_transfer rtl_sdr dump1090 readsb dump978 \
         rtl_433 kalibrate-rtl gr-gsm gnss-sdr rtl_biast ubertooth-util \
         crackle sniffle catnip whad bettercap killerbee whsniff kismet \
         aircrack-ng hcxdumptool hcxpcapngtool hashcat pm3 libnfc mfoc \
         mfcuk rfcat universal-radio-hacker chirpcat qcsuper srsran open5gs \
         gpsd ubxtool; do
  command -v "$t" >/dev/null 2>&1 && echo "OK  $t" || echo "MISS $t"
done
```

`MISS` → no abortar; consulta el wayfinder del protocolo para sustituto RX. Si no hay, declarar gap (Ruta A).

### 1.2 Hardware conectado (USB bus)

```sh
lsusb
ls /dev/ttyACM* /dev/ttyUSB* 2>/dev/null
ls /sys/class/net
```

Mapea vendor:product al slug usando `references/02-kit-sdr.md` (campo `spec`). Marcadores clave:

| Hardware | vendor:product | Notas |
|----------|----------------|-------|
| HackRF One | `1d50:6089` | |
| bladeRF 2.0 | `1d50:6130` | |
| USRP B210 | `2500:0020` | |
| RTL-SDR V4 | `0bda:2838` / `1d50:6089` (EC Nano) | `rtl_test -t` valida sample rate |
| CatSniffer (EC) | `1207:8000` | `/dev/ttyACM0` tras firmware |
| nRF52840 dongle | `1915:xxxx` | Nordic |
| Proxmark3 (Iceman) | `2d2d:504d` | |
| ACR122U | `072f:2200` | |
| Chameleon Ultra | `1915:c00a` | |
| Ubertooth One | `1d50:6000` (enum) / `1d50:6001` (op) | |
| Yard Stick One / CC1111 | `1d50:605b` | `/dev/ttyACM*` |
| ESP32-family | `303a:xxxx` (S3) / `10c4:ea60` (CP210x) | |
| Flipper Zero | `0483:df11` (DFU) / `0483:5740` (CDC) | |
| GPS u-blox NEO | — | Tramas `$GPGGA`/`$GNGGA` legibles en `/dev/ttyACM*` |

### 1.3 Permisos y drivers

```sh
# 1. Grupos de acceso a hardware
groups | grep -Eo 'dialout|plugdev|uucp|tty|video' | sort -u

# 2. udev rules cargadas
ls /etc/udev/rules.d/ | grep -Ei 'hackrf|rtl-sdr|rtlsdr|proxmark|ubertooth|cat|nordic|cp210|cdc-acm'

# 3. Drivers/modules cargados
lsmod | grep -Ei 'rtl2832|hackrf|bladerf|usbserial|cp210|cdc_acm|option|ftdi'

# 4. Bloqueos RF (kill switches — crítico en WiFi/BT)
rfkill list
```

- **Falta grupo** (`dialout`/`plugdev`) → binario abre pero device devuelve `Permission denied`. Acción: `usermod -aG` + relogin.
- **Falta udev rule** → device aparece como `root:root`. Acción: verificar paquete o copiar regla del repo del fabricante.
- **Falta driver** (`lsmod` vacío) → `dmesg | tail -50` muestra conexión sin bind. Acción: reinserción USB o `modprobe <driver>`.
- **`rfkill` bloquea** → `sudo rfkill unblock all` o switch físico. Algunos firmwares marauder no sobreviven soft-block.

### 1.4 Antena y bias-T (RF-critical)

Hardware conectado ≠ señal capturada. El agente no puede verificar la antena físicamente — **pregunta al operador**.

| Señal | Requisito | Síntoma si falta |
|-------|-----------|------------------|
| GNSS L1 | `rtl_biast -b 1` (bias-T ~5 V a antena activa) | `gqrx` muestra ruido plano a -90 dBm aunque la antena esté conectada |
| ADS-B 1090 | Antena quarter-wave (~6.9 cm) + filtro + LNA | `dump1090` reporta 0 mensajes/min |
| sub-GHz / GSM-850/900 | Antena telescópica o dipolo ajustada | `gqrx` muestra ruido térmico puro |
| 2.4 GHz ISM | Antena dipolo 2.4 GHz | SDR sin antena capta BT/Wi-Fi por acoplamiento, pero 5–10 dB por debajo |
| UWB (6.5/8 GHz) | Ningún radio del kit llega | Declarar gap de visibilidad, sin check aplicable |

### 1.5 Espacio y red

```sh
df -h "$LOOT_DIR"          # IQ típico: 2-8 MB/s; PCAP BLE: 200 KB/s
ip -br link show           # evita capturar tráfico del host
ip route show default      # si la auditoría es offline, confirmar aislamiento
```

- **Espacio < 5 GB libre** → captura larga aborta. Limpiar o comprimir (`rtl_sdr -s 2400000 - | gzip > file.iq.gz`).
- **WiFi monitor en interfaz equivocada** → `tshark -i <iface>` confirma BSSID del target; si captura en modo managed, el PCAP es inútil.

---

## 2. §diagnostico — tabla síntoma → causa probable → acción

### 2.1 Hardware no detectado / permisos

| Síntoma | Causa probable | Acción |
|---------|----------------|--------|
| `lsusb` no lista el SDR | Cable USB / puerto / alimentación insuficiente (HackRF+amp) | Otro puerto USB 3.0; alimentación externa si hay amp; `dmesg -w` al conectar |
| SDR en `lsusb` pero binario `Permission denied` | Falta grupo `dialout`/`plugdev` o udev rule | §1.3; `usermod -aG dialout,plugdev $USER` + relogin; reinstalar paquete para copiar udev rule |
| `/dev/ttyACM0` no aparece (CatSniffer/PM3/nRF) | Firmware no cargado, cable datos-only, driver CDC-ACM | `dmesg \| grep tty`; reiniciar dispositivo en modo bootloader; `modprobe cdc_acm` |
| `rtl_test` falla con "No supported devices found" | Driver RTL2832 no cargado o device claim por otro proceso | `lsmod \| grep rtl2832`; matar proceso que retiene el device (SDR# viejo, otro `rtl_*`) |
| `rfkill list` muestra "Soft blocked: yes" en WiFi/BT | Kill switch de OS o hardware | `sudo rfkill unblock all`; verificar switch físico de la laptop |
| Proxmark3 `pm3` cliente no detecta | Firmware Iceman no flasheado, puerto equivocado | `ls /dev/ttyACM*`; flash firmware Iceman; `pm3 -p /dev/ttyACM0` explícito |
| Ubertooth no enumera | Modo DFU o firmware corrupto | `ubertooth-util -v` para versión; reflasear con `ubertooth-programmer` |

### 2.2 Señal no visible / captura defectuosa

> **Regla de diagnosis (§3)**: ante "no veo la señal", revisa en ESTE orden — antena (§1.4) → gain/overflow (aquí) → driver (§1.3) → binario (§1.1) → gap de banda. Antena y gain explican el 80% de los casos.

| Síntoma | Causa probable | Acción |
|---------|----------------|--------|
| `gqrx` muestra ruido plano con hardware OK | Antena ausente/incorrecta, bias-T off (GNSS), dipolo mal sintonizado | §1.4 primero; `rtl_biast -b 1` para GNSS; pregunta al operador por antena conectada |
| Waterfall plano a 0 dBFS (clipping) | Gain excesivo satura el ADC | Bajar gain: RTL-SDR `-g 40–49`; HackRF `-a 1 -l <lna> -g <vga>` ajustados |
| Señal hundida en piso de ruido | Gain insuficiente | Subir gain gradualmente; verificar LNA externo (ADS-B 1090) |
| Captura parcial de canal Wi-Fi 80/160 MHz | IBW del SDR no cubre | HackRF ~20 MHz no ve canal completo → bladeRF/USRP o declarar limitación |
| `hackrf_transfer`/`rtl_test` reporta drops/overflows | Sample rate excede USB/host I/O | Bajar sample rate; cerrar otros procesos; SSD vs HDD; USB 3.0 directo (no hub) |
| OFDM grid recovery falla (LTE/5G NR) | Sin GPSDO lock | `uhd_usrp_probe ... clock_source=gpsdo`; conseguir GPSDO o declarar gap |
| `dump1090` reporta 0 mensajes/min | Antena 1090 sin LNA/filtro o mala orientación | §1.4 ADS-B; antena quarter-wave vertical + LNA + filtro 1090 |
| Sniffle no sigue conexión BLE establecida | Access Address no fijado correctamente | Setear AA **después** de CENTRAL (flush); los advertisements durante INITIATING resetean al advertising AA y rompen decoding de data PDUs |
| Ubertooth captura basura BT Classic | Hop no seguido, LAP desconocido | BR/EDR hop a 1600 h/s — solo `esp32_bluetooth_classic_sniffer` o Ubertooth follow por LAP conocido |
| RFID: reader no lee tag | Modo activo en observacional, tag ausente del campo | En observacional/defensivo usar `hf 14a sniff` (pasivo, no alimenta); `hf mf autopwn` es activo |

### 2.3 Análisis no decodifica (CR offline)

| Síntoma | Causa probable | Acción |
|---------|----------------|--------|
| Wireshark muestra "Malformed packet" masivo | Decoder equivocado o captura corrupta | Confirmar dissector correcto: BTBR/BLE/802.15.4/LoRaTap/GSMTAP. Versión antigua de Wireshark → actualizar |
| `crackle` falla: "no STK found" | Pairing no está en el PCAP | El evento pairing faltó de la captura — re-capturar SP/PHY+LL durante el bonding; no es fortaleza de cripto |
| `hashcat -m 22000` no carga | PCAP sin PMKID/EAPOL completo | Re-capturar; PMKID clientless chain `hcxdumptool` → `hcxpcapngtool` requiere interacción del cliente |
| `kraken` A5/1 no encuentra clave | Keystream insuficiente o BB-.tables no indexadas | Capturar más tráfico; verificar `index` de BB tables (~2 TB); no descartar fortaleza |
| `hf mf autopwn` no recupera keys | Distancia/ángulo del tag, clave desconocida | Probar `hf mf list` + `mfkey32/64` del sniff del reader; distancia 1-3 cm; tag MIFARE Plus evade Classic |
| Análisis sobre PCAP con overflows ≠ 0 | Captura base silenciosamente incompleta | Re-capturar (safe-capture §4); los overflows hacen que se decodifique basura presentada como hallazgo |
| Conclusión sin artefacto citado | Opinión flotante, no evidencia | Cada conclusión cita `loot/captures/...` + comando; mapeo artefacto→hallazgo obligatorio |

---

## 3. §orden — regla de diagnosis

Ante "no veo / no funciona", NO declare gap inmediatamente. Sigue este orden:

1. **Antena** (§1.4) — ¿está conectada y es correcta para la banda? `gqrx` con ruido plano + hardware OK = antena primero.
2. **Gain/overflow** (§2.2) — ¿satura o se hunde? Ajustar antes de declarar "sin señal".
3. **Driver/permisos** (§1.3) — ¿el device abre? `Permission denied` ≠ hardware roto.
4. **Binario/decoder** (§1.1, §2.3) — ¿la tool y el decoder correctos están? `which`, versión de Wireshark.
5. **Banda** — ¿el radio llega a la frecuencia? RTL-SDR no ve 2.4 GHz; UWB 6.5/8 GHz no lo cubre ningún radio del kit.
6. **Solo entonces** → declarar gap de visibilidad en `loot/notes/gaps.md` (Ruta A) o escalar (CONSULTA).

> Antena y gain explican ~80% de los "no veo la señal". Una declaración de gap sin haber revisado antena+gain es
> un falso negativo.

---

## 4. §falsos-positivos — hallazgo que parece confirmado pero no lo es

Antes de registrar, descarta el falso positivo típico del patrón (ver §4 abajo columna
"Falso positivo típico" por familia). Casos transversales:

| Síntoma (parece hallazgo) | Falso positivo típico | Verificación |
|----------------------------|----------------------|--------------|
| Crack falló → "cripto fuerte" | El evento pairing/join/handshake **no estaba** en la captura (gap de captura, no fortaleza) | Re-capturar; confirmar evento presente en el PCAP antes de atribuir a fortaleza |
| Decodificación produce basura | Captura base con overflows ≠ 0 (silenciosamente incompleta) | Verificar overflow counters en la envolvente; re-capturar si > 0 |
| "Señal desconocida" en survey | Interferencia local (router propio, microondas, Bluetooth del host) | Apagar host BT/Wi-Fi; correlacionar horario; mover antena |
| Tráfico en claro "descubierto" | Decoder equivocado muestra bytes legibles por coincidencia | Confirmar dissector; validar con longitud/checkbox del protocolo |
| Anomalía GNSS C/N0 | Multipath urbano o jamming legítimo (radar militar) | Correlacionar con horario/ubicación; no reportar spoof sin forge observado |
| "BLE de dispositivo desconocido" | Dispositivo del propio operador/entorno | Correlacionar contra inventario antes de etiquetar stalking |

> **"No observado" bajo una ventana finita es gap de visibilidad, no evidencia de ausencia.** Pero "observado"
> también puede ser falso positivo si la captura base está corrupta o el decoder no corresponde. Verifica ambos
> extremos antes de registrar.

---

## 5. Mapeo a fases downstream

- **SKILL.md Fase 0** cita §setup como cuerpo del check de entorno.
- **SKILL.md Ruta B** cita §diagnostico como paso anterior a escalar.
- **Wayfinders** (`references/NN-proto.md`) pueden citar "ver troubleshooting §2.2" para la familia específica.
- **Fase 7.1 (validación):** cada "no funciona" documentado en `loot/notes/` debe referenciar §orden — sin ese
  orden recorrido, el gap es débil.
