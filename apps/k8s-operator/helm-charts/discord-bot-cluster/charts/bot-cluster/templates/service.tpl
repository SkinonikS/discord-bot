apiVersion: v1
kind: Service
metadata:
  name: {{ include "discord-bot-cluster.name" . | quote }}
  namespace: {{ .Release.Namespace | quote }}
spec:
  selector:
    {{- include "discord-bot-cluster.selectorLabels" . | nindent 4 }}
  ports:
    - port: 6379
      protocol: TCP
      targetPort: "redis"
