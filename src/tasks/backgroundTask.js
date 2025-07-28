// import * as TaskManager from 'expo-task-manager';
// import * as BackgroundFetch from 'expo-background-fetch';
// import { getSales, clearSales } from '../../src/services/storage/saleStorage';
// import { generatePdf } from '../../src/services/reports/pdfGenerator';

// const TASK_NAME = 'SALES_PDF_GENERATOR';

// TaskManager.defineTask(TASK_NAME, async () => {
//   const now = new Date();
//   if (now.getHours() === 22) {
//     const sales = await getSales();
//     if (sales.length > 0) {
//       await generatePdf(null,sales,null);
//       await clearSales();
//     }
//   }
//   return BackgroundFetch.BackgroundFetchResult.NewData;
// });

// export const initBackgroundTask = async () => {
//   const status = await BackgroundFetch.getStatusAsync();
//   if (status === BackgroundFetch.Status?.Available) {
//     await BackgroundFetch.registerTaskAsync(TASK_NAME, {
//       minimumInterval: 3600, // check every hour
//       stopOnTerminate: false,
//       startOnBoot: true,
//     });
//   }
// };
