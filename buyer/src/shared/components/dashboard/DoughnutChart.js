import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js';
import { get } from 'lodash';
ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({data}) => {
  return (
    <Doughnut data={data} options={get(data, "options")} />
  )
}

export default DoughnutChart
