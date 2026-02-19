#!/bin/bash
set -e

# Size of swap in gigabytes
SWAP_SIZE_GB=2
SWAP_FILE="/swapfile"

echo "=== CHECKING MEMORY ==="
free -h

# Check if swap exists
if [ -f "$SWAP_FILE" ]; then
    echo "Swap file $SWAP_FILE already exists."
else
    echo "Creating $SWAP_SIZE_GB GB swap file..."
    fallocate -l ${SWAP_SIZE_GB}G $SWAP_FILE
    chmod 600 $SWAP_FILE
    mkswap $SWAP_FILE
    swapon $SWAP_FILE
    echo "$SWAP_FILE none swap sw 0 0" | tee -a /etc/fstab
    echo "Swap created successfully."
fi

# Tune swappiness for better performance with swap
# Value 10 means "use swap only when RAM is 90% full"
sysctl vm.swappiness=10
echo "vm.swappiness=10" | tee -a /etc/sysctl.conf

echo "=== MEMORY AFTER SWAP ==="
free -h
