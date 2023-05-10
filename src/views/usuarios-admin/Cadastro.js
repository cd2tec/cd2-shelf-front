import React, { useEffect, useState } from 'react';
import {
	Container, Grid, makeStyles, Card, CardHeader,
	Divider, CardContent, CardActions, Button, FormControlLabel,
	Checkbox, Collapse
} from '@material-ui/core';
import {useNavigate, useParams} from 'react-router-dom';
import { ExpandLess, ExpandMore } from '@material-ui/icons';

import { TextField } from '../../components/material'

import Page from '../../components/Page';
import { UsuarioAPI, filterErrors, defaultProcessCatch, PermissaoAPI } from '../../services/api';
import alerts from '../../utils/alerts';

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: theme.palette.background.dark,
		minHeight: '100%',
		paddingBottom: theme.spacing(3),
		paddingTop: theme.spacing(3)
	},
	actions: {
		padding: 15,
	}
}));

const Cadastro = () => {
	const { user } = useParams()
	const classes = useStyles();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState();
	const [permissoes, setPermissoes] = useState([]);
  const [permissoesValue, setPermissoesValue] = useState([]);
  const [permissoesCollapseValue, setPermissoesCollapseValue] = useState({});

  const submit = () => {
    if (loading) return

    setLoading(true);
	if (user) {
		UsuarioAPI.updateAdmin({
			email: email,
			permissoes: permissoesValue
		})
		.then(_ => {
			navigate('/admin/usuarios');
			alerts.snackbars.success('Usuário admin alterado com sucesso');
		})
		.finally(() => setLoading(false))
		.catch(defaultProcessCatch(setErrors));
		return
	}
    UsuarioAPI.registerAdmin({email, permissoes_uuid: permissoesValue})
      .then(_ => {
        navigate('/admin/usuarios');
        alerts.snackbars.success('Usuário feito admin com sucesso');
      })
      .finally(() => setLoading(false))
      .catch(defaultProcessCatch(setErrors));
  }

	const processPermissoes = p => {
    if (!p) return []

    const pData = []

    p.map(per => {
      const recursos = per.permissao.split(' - ')
      let i = 1
      recursos.reduce((previous, current) => {
        pData.push({id: current, label: current, value: i === recursos.length ? per.uuid : current, parentId: i === 1 ? null : previous})
        i++
        return current
      }, "")
      return null
    })

    const npData = []

    pData.map(p => {
      if (p.label === p.value) {
        if (!npData.find(np => np.label === p.label && np.value === p.value)) {
          npData.push(p)
        }
      } else {
        npData.push(p)
      }
      return null
    })

    const makeTree = (nodes, parentId) => (
      nodes
      .filter((node) => node.parentId === parentId)
      .reduce(
        (tree, node) => [
          ...tree,
          {
            ...node,
            children: makeTree(nodes, node.id),
          },
        ],
        [],
      )
    )

    const tree = makeTree(npData, null)

    const getChildrenToCollapse = (p, val) => {
      if (p.children.length) {
        const colValArr = p.children.map(pp => getChildrenToCollapse(pp, val))
        const colVal = {}
        colValArr.map(col => colVal[col.label] = false)
        return colVal
      } else {
        return val
      }
    }

    tree.map(p => {
      const childrenCollapseVal = getChildrenToCollapse(p, {})
      setPermissoesCollapseValue(childrenCollapseVal)
      return null
    })

    return tree
  }

	const checkChildrenVal = (p, checked) => {
    if (p.children.length) {
      const arr = p.children.map(pp => checkChildrenVal(pp, checked))
      return arr.flat()
    } else {
      return [...checked, permissoesValue.includes(p.value)]
    }
  }

  const getAllChildrenVal = (p, val) => {
    if (p.children.length) {
      const arr = p.children.map(pp => getAllChildrenVal(pp, val))
      return arr.flat()
    } else {
      return [...val, p.value]
    }
  }

	const renderPermissao = (p, i) => (
    p.children.length ? <Grid style={{marginLeft: i * 20}}>
      {permissoesCollapseValue[p.label] ?
        <ExpandLess style={{position: 'relative', top: 8, right: 5, cursor: 'pointer'}} onClick={_ => {
          const newVal = {...permissoesCollapseValue}
          newVal[p.label] = false
          setPermissoesCollapseValue(newVal)
        }} /> :
        <ExpandMore style={{position: 'relative', top: 8, right: 5, cursor: 'pointer'}} onClick={_ => {
          const newVal = {...permissoesCollapseValue}
          newVal[p.label] = true
          setPermissoesCollapseValue(newVal)
        }}/>
      }
      <FormControlLabel
        label={p.label}
        control={
          <Checkbox
            checked={(() => {
              const arr = checkChildrenVal(p, [])
              if (!arr.includes(false))
                return true
              else
                return false
            })()}
            indeterminate={(() => {
              const arr = checkChildrenVal(p, [])
              if (arr.includes(true) && arr.includes(false))
                return true
              else
                return false
            })()}
            onChange={(_, checked) => {
              if (!checked) {
                const arr = getAllChildrenVal(p, [])
                setPermissoesValue(permissoesValue.filter(pp => !arr.includes(pp)))
              } else {
                const arr = getAllChildrenVal(p, [])
                setPermissoesValue([...arr, ...permissoesValue])
              }
            }}
          />
        }
      />
      <Collapse in={permissoesCollapseValue[p.label]} unmountOnExit>
        <Grid direction="column" container>
          {p.children.map(pp => renderPermissao(pp, i + 2))}
        </Grid>
      </Collapse>
      </Grid> : <FormControlLabel
        label={p.label}
        style={{marginLeft: i * 27}}
        control={
          <Checkbox
            checked={permissoesValue.includes(p.value)}
            onChange={(_, checked) => {
              if (!checked) {
                setPermissoesValue(permissoesValue.filter(pv => pv !== p.value))
              } else {
                setPermissoesValue([p.value, ...permissoesValue])
              }
            }}
          />
        }
      />
  )

	useEffect(() => {
		PermissaoAPI.listUserAdm()
			.then(rs => setPermissoes(processPermissoes(rs.permissoes || [])))
			.catch(defaultProcessCatch)

		if (user) {
			setEmail(user)
			UsuarioAPI.getUsuarioAdmin(user)
				.then(rs => setPermissoesValue(rs.permissoes ? rs.permissoes.map(p => p.uuid) : []))
				.catch(defaultProcessCatch)
		}
	}, [user])

	return (
		<Page title="Usuários / Criar" className={classes.root}>
			<Container maxWidth={false} style={{ marginTop: 20 }}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Card>
							<CardHeader title="Fazer usuário Admin" />
							<Divider />
							<CardContent>
								<Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="email"
                      label="Email"
                      value={email}
                      onChange={setEmail}
                      errorText={filterErrors(errors, 'email')} />
                  </Grid>
									<Grid item xs={12} md={12}>
                    Permissões
                    <Divider style={{marginBottom: 20}}/>
                    <div style={{marginLeft: 10}}>
                      {permissoes.map(p => renderPermissao(p, 0))}
                    </div>
                  </Grid>
                </Grid>
							</CardContent>
							<Divider />
							<CardActions className={classes.actions}>
								<Button disabled={loading} variant="contained" color="primary" onClick={submit}>Cadastrar</Button>
							</CardActions>
						</Card>
					</Grid>
				</Grid>
			</Container>
		</Page>
	)
};

export default Cadastro;
