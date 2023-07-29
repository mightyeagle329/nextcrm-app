import React from "react";

import { DataTable } from "@/components/ui/data-table";
import RightViewModal from "@/components/modals/right-view-modal";

import { columns } from "../../components/Columns";
import { NewAccountForm } from "./NewAccountForm";
import { getAccounts } from "@/actions/crm/get-accounts";
import { getAllCrmData } from "@/actions/crm/get-crm-data";

type Props = {};

const AccountView = async () => {
  const accounts: any[] = await getAccounts();
  const crmData = await getAllCrmData();
  const { users, industries } = crmData;

  return (
    <div className="border rounded-md p-5 mt-5">
      <div className="flex items-center gap-3">
        <div className="flex w-full h-full">
          <RightViewModal
            label={"Add new account"}
            title="Add new account"
            description=""
          >
            <NewAccountForm industries={industries} users={users} />
          </RightViewModal>
        </div>
      </div>
      <div>
        <DataTable data={accounts} search="name" columns={columns} />
      </div>
    </div>
  );
};

export default AccountView;
