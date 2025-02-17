
FROM ubuntu:20.04
MAINTAINER David Worms

ARG DEBIAN_FRONTEND=nonintercative
RUN \
  apt update -y && \
  # Install Node.js dependencies
  apt install -y build-essential curl git && \
  # Install SSH and sudo
  apt-get install -y openssh-server sudo && \
  ssh-keygen -A && \
  mkdir -p /run/sshd

ADD ./entrypoint.sh /entrypoint.sh
RUN mkdir -p /nikita
WORKDIR /nikita/packages/system

# Sudo User
RUN useradd nikita -d /home/nikita -m -s /bin/bash && \
  mkdir -p /home/nikita && \
  chown nikita /home/nikita && \
  chmod 700 /home/nikita && \
  echo 'nikita ALL=(ALL) NOPASSWD: ALL' > /etc/sudoers.d/nikita
USER nikita

# Install Node.js
ENV NODE_VERSION stable
RUN curl -L https://git.io/n-install | bash -s -- -y
# Note, bashrc not sourced unless running interactively
ENV PATH /home/nikita/n/bin:$PATH

RUN \
  ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N '' && \
  cat ~/.ssh/id_ed25519.pub > ~/.ssh/authorized_keys

ENTRYPOINT ["/entrypoint.sh"]
