#!/bin/bash

# Setup the /dev/gps0 device (manual)
#sudo cp /usr/local/kinisi-agent-nodejs/scripts/71-kinisi.rules /etc/udev/rules.d/.
#dpkg-reconfigure gpsd
  # A wizard will prompt you:
  # 1. Select Yes to start gpsd automatically.
  # 2. Select No to automatically recognize GPS devices !!! IMPORTANT !!!
  # 3. Enter "/dev/gps0" as the device to use
# Setup the PPP internet connection dialer
sudo apt-get -y update
sudo apt-get -y install wvdial
sudo cp /usr/local/kinisi-agent-nodejs/scripts/wvdial.conf /etc/.
# Install a modern version of usb-modeswitch and usb-modeswitch-data
# It should be at least 2.2.0 and 20140529 which should be included by default now in raspbian
# http://archive.raspbian.org/raspbian/pool/main/u/usb-modeswitch/usb-modeswitch_2.2.0%2brepack0-1%2bb1_armhf.deb
# http://archive.raspbian.org/raspbian/pool/main/u/usb-modeswitch-data/usb-modeswitch-data_20140529-1_all.deb
# Manual. Get from ai1dev1
#sudo apt-get update
#sudo apt-get install usb-modeswitch-data usb-modeswitch
# Install service
cp /usr/local/kinisi-agent-nodejs/scripts/kinisiinternet /etc/init.d/kinisiinternet
chmod 755 /etc/init.d/kinisiinternet
update-rc.d kinisiinternet defaults
