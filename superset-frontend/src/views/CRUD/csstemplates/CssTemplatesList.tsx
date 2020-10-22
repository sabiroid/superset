/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useMemo, useState } from 'react';
import { t } from '@superset-ui/core';
import moment from 'moment';
import { useListViewResource } from 'src/views/CRUD/hooks';
import withToasts from 'src/messageToasts/enhancers/withToasts';
import SubMenu, { SubMenuProps } from 'src/components/Menu/SubMenu';
import { IconName } from 'src/components/Icon';
import ActionsBar, { ActionProps } from 'src/components/ListView/ActionsBar';
// import ListView, { Filters } from 'src/components/ListView';
import ListView from 'src/components/ListView';
import CssTemplateModal from './CssTemplateModal';
import { TemplateObject } from './types';

const PAGE_SIZE = 25;

interface CssTemplatesListProps {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
}

function CssTemplatesList({
  addDangerToast,
  addSuccessToast,
}: CssTemplatesListProps) {
  const {
    state: {
      loading,
      resourceCount: templatesCount,
      resourceCollection: templates,
    },
    hasPerm,
    fetchData,
    refreshData,
  } = useListViewResource<TemplateObject>(
    'css_template',
    t('css templates'),
    addDangerToast,
  );
  const [cssTemplateModalOpen, setCssTemplateModalOpen] = useState<boolean>(
    false,
  );
  const [
    currentCssTemplate,
    setCurrentCssTemplate,
  ] = useState<TemplateObject | null>(null);

  const canCreate = hasPerm('can_add');
  const canEdit = hasPerm('can_edit');
  const canDelete = hasPerm('can_delete');

  function handleCssTemplateEdit(cssTemplate: TemplateObject) {
    setCurrentCssTemplate(cssTemplate);
    setCssTemplateModalOpen(true);
  }

  const initialSort = [{ id: 'template_name', desc: true }];
  const columns = useMemo(
    () => [
      {
        accessor: 'template_name',
        Header: t('Name'),
      },
      {
        Cell: ({
          row: {
            original: { created_on: createdOn },
          },
        }: any) => {
          const date = new Date(createdOn);
          const utc = new Date(
            Date.UTC(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              date.getHours(),
              date.getMinutes(),
              date.getSeconds(),
              date.getMilliseconds(),
            ),
          );

          return moment(utc).fromNow();
        },
        Header: t('Created On'),
        accessor: 'created_on',
        size: 'xl',
      },
      {
        accessor: 'created_by',
        disableSortBy: true,
        Header: t('Created By'),
        Cell: ({
          row: {
            original: { created_by: createdBy },
          },
        }: any) =>
          createdBy ? `${createdBy.first_name} ${createdBy.last_name}` : '',
        size: 'xl',
      },
      {
        Cell: ({
          row: {
            original: { changed_on_delta_humanized: changedOn },
          },
        }: any) => changedOn,
        Header: t('Last Modified'),
        accessor: 'changed_on_delta_humanized',
        size: 'xl',
      },
      {
        Cell: ({ row: { original } }: any) => {
          const handleEdit = () => handleCssTemplateEdit(original);
          const handleDelete = () => {}; // openDatabaseDeleteModal(original);

          const actions = [
            canEdit
              ? {
                  label: 'edit-action',
                  tooltip: t('Edit template'),
                  placement: 'bottom',
                  icon: 'edit' as IconName,
                  onClick: handleEdit,
                }
              : null,
            canDelete
              ? {
                  label: 'delete-action',
                  tooltip: t('Delete template'),
                  placement: 'bottom',
                  icon: 'trash' as IconName,
                  onClick: handleDelete,
                }
              : null,
          ].filter(item => !!item);

          return <ActionsBar actions={actions as ActionProps[]} />;
        },
        Header: t('Actions'),
        id: 'actions',
        disableSortBy: true,
        hidden: !canEdit && !canDelete,
        size: 'xl',
      },
    ],
    [canDelete, canCreate],
  );

  const subMenuButtons: SubMenuProps['buttons'] = [];

  if (canCreate) {
    subMenuButtons.push({
      name: (
        <>
          <i className="fa fa-plus" /> {t('Css Template')}
        </>
      ),
      buttonStyle: 'primary',
      onClick: () => {
        setCurrentCssTemplate(null);
        setCssTemplateModalOpen(true);
      },
    });
  }

  return (
    <>
      <SubMenu name={t('CSS Templates')} buttons={subMenuButtons} />
      <CssTemplateModal
        addDangerToast={addDangerToast}
        cssTemplate={currentCssTemplate}
        onCssTemplateAdd={() => refreshData()}
        onHide={() => setCssTemplateModalOpen(false)}
        show={cssTemplateModalOpen}
      />
      <ListView<TemplateObject>
        className="css-templates-list-view"
        columns={columns}
        count={templatesCount}
        data={templates}
        fetchData={fetchData}
        // filters={filters}
        initialSort={initialSort}
        loading={loading}
        pageSize={PAGE_SIZE}
      />
    </>
  );
}

export default withToasts(CssTemplatesList);