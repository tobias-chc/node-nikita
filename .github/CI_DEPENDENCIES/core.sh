#!/bin/bash

# Install java dependencies
sudo apt install -y openssh-server openssl && sudo systemctl start sshd
sudo sudo apt install -y openjdk-8-jre-headless
# SSH Key Generation
sudo ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ''
cat ~/.ssh/id_ed25519.pub > ~/.ssh/authorized_keys
