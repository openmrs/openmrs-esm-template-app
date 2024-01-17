import React from "react";
import { useActiveVisits } from "./visits.resource";
import { ErrorState, formatDatetime, parseDate } from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";
import styles from "./visits.scss";
import {
  DataTable,
  DataTableSkeleton,
  InlineLoading,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@carbon/react";

const ActiveVisitsTable: React.FC = () => {
  const { t } = useTranslation();
  const { visits, isLoadingVisits, errorFetchingVisits, isValidating } =
    useActiveVisits();

  const headerData = [
    {
      id: 0,
      header: t("visitStartTime", "Visit Time"),
      key: "visitStartTime",
    },
    {
      id: 1,
      header: t("idNumber", "ID Number"),
      key: "idNumber",
    },
    {
      id: 2,
      header: t("name", "Name"),
      key: "name",
    },
    {
      id: 3,
      header: t("gender", "Gender"),
      key: "gender",
    },
    {
      id: 4,
      header: t("age", "Age"),
      key: "age",
    },
    {
      id: 5,
      header: t("visitType", "Visit Type"),
      key: "visitType",
    },
  ];

  const rows = visits?.map((visit) => ({
    age: visit?.patient?.person?.age,
    id: visit.uuid,
    idNumber: visit?.patient?.identifiers?.[0]?.identifier,
    gender: visit?.patient?.person?.gender,
    location: visit?.location?.uuid,
    name: visit?.patient?.person?.display,
    patientUuid: visit?.patient?.uuid,
    visitStartTime: formatDatetime(parseDate(visit?.startDatetime)),
    visitType: visit?.visitType?.display,
    visitUuid: visit.uuid,
  }));

  if (isLoadingVisits) {
    return (
      <div className={styles.activeVisitsContainer}>
        <div className={styles.activeVisitsDetailHeaderContainer}>
          <div className={styles.desktopHeading}>
            <h4>{t("activeVisits", "Active Visits")}</h4>
          </div>
          <div className={styles.backgroundDataFetchingIndicator}>
            <span>{isValidating ? <InlineLoading /> : null}</span>
          </div>
        </div>
        <DataTableSkeleton
          rowCount={5}
          showHeader={false}
          showToolbar={false}
          zebra
          columnCount={headerData?.length}
          size="sm"
        />
      </div>
    );
  }

  if (errorFetchingVisits) {
    return (
      <ErrorState
        error={errorFetchingVisits}
        headerTitle={t(
          "errorFetchingActiveVisits",
          "Error fetching active visits"
        )}
      />
    );
  }

  return (
    <div className={styles.activeVisitsContainer}>
      <div className={styles.activeVisitsDetailHeaderContainer}>
        <div className={styles.desktopHeading}>
          <h4>{t("activeVisits", "Active Visits")}</h4>
        </div>
        <div className={styles.backgroundDataFetchingIndicator}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
        </div>
      </div>
      <DataTable rows={rows} headers={headerData} size="sm" useZebraStyles>
        {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
          <TableContainer className={styles.tableContainer}>
            <Table className={styles.activeVisitsTable} {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => {
                  return (
                    <React.Fragment key={index}>
                      <TableRow {...getRowProps({ row })}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default ActiveVisitsTable;
