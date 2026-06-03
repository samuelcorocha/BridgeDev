import { renderToBuffer } from "@react-pdf/renderer"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { ReadinessReport, Sandbox, Challenge, User } from "@prisma/client"
import type { ReportFeedback } from "@/types"

type ReportWithDeps = ReadinessReport & {
  sandbox: Sandbox & { challenge: Challenge }
  user: User
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#1f2937",
  },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 11, color: "#6b7280" },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  scoreNumber: { fontSize: 48, fontWeight: "bold" },
  scoreMeta: { flex: 1 },
  certified: { color: "#16a34a", fontWeight: "bold", marginTop: 4, fontSize: 11 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  dimensionBlock: { marginBottom: 14 },
  dimensionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  pointText: { color: "#15803d", marginBottom: 2, fontSize: 10 },
  improvementText: { color: "#92400e", marginBottom: 2, fontSize: 10 },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#9ca3af",
  },
})

const LABELS: Record<string, string> = {
  git: "Git & Versionamento",
  tests: "Cobertura de Testes",
  codeQuality: "Qualidade de Código",
  docs: "Documentação",
  delivery: "Entrega no Prazo",
}

export async function generateReportPdf(report: ReportWithDeps): Promise<Buffer> {
  const feedback = report.feedback as unknown as ReportFeedback[]
  const issuedAt = new Date(report.createdAt).toLocaleDateString("pt-BR")

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Prontidão Técnica</Text>
          <Text style={styles.subtitle}>
            {report.user.name} · {report.sandbox.challenge.title} · Emitido em{" "}
            {issuedAt}
          </Text>
        </View>

        <View style={styles.scoreRow}>
          <Text style={styles.scoreNumber}>{report.scoreTotal.toFixed(1)}</Text>
          <View style={styles.scoreMeta}>
            <Text>Pontuação Final (0–100)</Text>
            {report.certified && (
              <Text style={styles.certified}>
                Certificado de Prontidão Emitido
              </Text>
            )}
          </View>
        </View>

        <View>
          <Text style={styles.sectionTitle}>Análise por Dimensão</Text>
          {feedback.map((f) => (
            <View key={f.dimension} style={styles.dimensionBlock}>
              <View style={styles.dimensionRow}>
                <Text>{LABELS[f.dimension] ?? f.dimension}</Text>
                <Text>{f.score.toFixed(0)}/100</Text>
              </View>
              {f.points.map((p, i) => (
                <Text key={i} style={styles.pointText}>
                  + {p}
                </Text>
              ))}
              {f.improvements.map((p, i) => (
                <Text key={i} style={styles.improvementText}>
                  ▲ {p}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          BridgeDev · Plataforma de Simulação de Prontidão Técnica
        </Text>
      </Page>
    </Document>
  )

  return Buffer.from(await renderToBuffer(doc))
}
