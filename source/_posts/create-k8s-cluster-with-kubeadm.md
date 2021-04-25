---
title: 使用 kubeadm 创建 k8s 集群
date: 2021-04-25 11:30:05
tags: k8s kubernets docker
---

## 环境
* 操作系统: Centos7

## 准备工作
* 关闭swap
* 关闭selinux
* 确保br_netfilter 内核载入
```
手动载入:
modprobe br_netfilter

永久生效:
cat <<EOF | tee /etc/modules-load.d/k8s.conf 
br_netfilter 
EOF

cat <<EOF | tee /etc/sysctl.d/k8s.conf 
net.bridge.bridge-nf-call-ip6tables = 1 
net.bridge.bridge-nf-call-iptables = 1 
EOF

sysctl --system
```


## 安装 k8s 组件
kubeadm, kubelet所有节点必须安装

```
cat <<EOF | tee /etc/yum.repos.d/k8s.repo
[k8s]
name=k8s repo
baseurl=http://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64/
enabled=1
gpgcheck=0 
EOF

yum install -y kubelet kubeadm kubectl
systemctl enable --now kubelet
```

## 安装 docker
可以用阿里云的仓库
```
yum install docker-ce-19.03.15 docker-ce-cli-19.03-15
```

配置
```
mkdir /etc/docker 
cat <<EOF | tee /etc/docker/daemon.json 
{   
  "exec-opts": ["native.cgroupdriver=systemd"],   
  "log-driver": "json-file",   
  "log-opts": {
      "max-size": "100m"   
    },   
  "storage-driver": "overlay2" 
} 
EOF

systemctl enable docker 
systemctl daemon-reload
systemctl restart docker
```

## 准备 kubeadm 配置
生产默认初始配置
```
kubeadm config print  init-defaults
```

配置文件示例
```
apiVersion: kubeadm.k8s.io/v1beta2
bootstrapTokens:
- groups:
  - system:bootstrappers:kubeadm:default-node-token
  token: abcdef.0123456789abcdef
  ttl: 24h0m0s
  usages:
  - signing
  - authentication
kind: InitConfiguration
localAPIEndpoint:
  advertiseAddress: 192.168.2.231
  bindPort: 6443
nodeRegistration:
  criSocket: /var/run/dockershim.sock
  name: test1
  taints:
  - effect: NoSchedule
    key: node-role.kubernetes.io/master
---
apiServer:
  timeoutForControlPlane: 4m0s
apiVersion: kubeadm.k8s.io/v1beta2
certificatesDir: /etc/kubernetes/pki
clusterName: kubernetes
controllerManager: {}
dns:
  type: CoreDNS
etcd:
  local:
    dataDir: /var/lib/etcd
imageRepository: registry.aliyuncs.com/google_containers
kind: ClusterConfiguration
kubernetesVersion: v1.20.0
networking:
  dnsDomain: demo.com
  podSubnet: 10.244.0.0/16
  serviceSubnet: 10.96.0.0/12
scheduler: {}
---
apiVersion: kubeproxy.config.k8s.io/v1alpha1
kind: KubeProxyConfiguration
mode: ipvs
---
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
cgroupDriver: systemd
```

## 初始化集群
master节点
```
kubeadm init --config=kubeadm_config
```

node节点，参考`kubeadm init`的输出

添加network addon
```
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```
