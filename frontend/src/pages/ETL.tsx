/**
 * ETL — Data Preparation page wrapper.
 * Passes navigation callback to EtlUpload.
 */
import EtlUpload from '../components/EtlUpload'

interface Props {
  onNavigateToAnalyst?: () => void
}

export default function ETL({ onNavigateToAnalyst }: Props) {
  return <EtlUpload onNavigateToAnalyst={onNavigateToAnalyst} />
}
