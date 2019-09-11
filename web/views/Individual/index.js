import React from 'react';
import Grid from '@material-ui/core/Grid';
import { useRouter } from 'next/router';
import { useApolloClient, useQuery, useMutation } from '@apollo/react-hooks';
import { withApollo } from '../../lib/apollo';

import Layout from '../../components/Layout';
import IndividualRoundStatus from '../../components/IndividualRoundStatus';
import Info from '../../components/Info';
import ApplyInfo from '../../components/ApplyInfo';

import * as S from './styles';
import * as Q from './queries';

function Individual() {
  const router = useRouter();
  const client = useApolloClient();
  const { loading, error, data, fetchMore, networkStatus } = useQuery(
    Q.INDIVIDUAL_APPLICATIONS
  );

  const [deleteApplication] = useMutation(Q.DELETE_INDIVIDUAL_APPLICATION);

  const handleEditApplication = async id => {
    try {
      const password = window.prompt('신청시 작성한 비밀번호를 입력해 주세요.');
      if (!password) {
        return;
      }

      const { data } = await client.query({
        query: Q.VALIDATE_APPLICATION_PASSWORD,
        variables: {
          type: 'individual',
          id,
          password
        },
        fetchPolicy: 'network-only'
      });

      if (data) {
        if (data.validateApplicationPassword) {
          router.push({
            pathname: `/individual/${id}`
          });
          window.sessionStorage.setItem('tmp_password', password);
        } else {
          window.alert('비밀번호가 일치하지 않습니다.');
        }
      }
    } catch (e) {
      console.log(e);
      const { message } = e;
      switch (message) {
        default: {
          window.alert('오류가 발생했습니다. 다시 시도해 주세요.');
        }
      }
    }
  };

  const handleDeleteApplication = async id => {
    try {
      const password = window.prompt('신청시 작성한 비밀번호를 입력해 주세요.');
      if (!password) {
        return;
      }
      const confirm = window.confirm('정말로 삭제하시겠습니까?');
      if (!confirm) {
        return;
      }
      await deleteApplication({
        variables: {
          id,
          password
        },
        update(
          cache,
          {
            data: { deleteIndividualApplication }
          }
        ) {
          const { individualApplications } = cache.readQuery({
            query: Q.INDIVIDUAL_APPLICATIONS
          });
          cache.writeQuery({
            query: Q.INDIVIDUAL_APPLICATIONS,
            data: {
              individualApplications: individualApplications.filter(
                item => item.id !== deleteIndividualApplication.id
              )
            }
          });
        }
      });

      window.alert('성공적으로 삭제되었습니다!');
    } catch (e) {
      const { message } = e;
      switch (message) {
        case 'GraphQL error: Password does not match.': {
          window.alert('비밀번호가 일치하지 않습니다.');
          break;
        }
        default: {
          window.alert('오류가 발생했습니다. 다시 시도해 주세요.');
        }
      }
    }
  };

  return (
    <Layout>
      <S.Content>
        <S.Title>개인전</S.Title>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Info
              dates={[
                {
                  date: '2019년 9월 21일(토)',
                  round: '1대 ~ 9대'
                },
                {
                  date: '2019년 9월 22일 (일)',
                  round: '10대 ~ 45대'
                }
              ]}
              path="/individual/schedule"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ApplyInfo
              startDate="2019년 9월 21일(토)"
              endDate="2019년 9월 22일 (일)"
              path="/individual/apply"
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <IndividualRoundStatus
              applications={data && data.individualApplications}
              onEdit={handleEditApplication}
              onDelete={handleDeleteApplication}
            />
          </Grid>
        </Grid>
      </S.Content>
    </Layout>
  );
}

export default withApollo(Individual);
