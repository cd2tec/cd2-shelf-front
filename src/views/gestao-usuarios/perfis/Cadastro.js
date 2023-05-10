import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
	Container, Grid, makeStyles, Card, CardHeader,
	Divider, CardContent, CardActions, Button, FormControlLabel, Checkbox, Collapse,
  RadioGroup
} from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';

import { RadioGroupOption ,TextField } from '../../../components/material'

import Page from '../../../components/Page';
import { PerfilServiceApi, PermissaoAPI, defaultProcessCatch, filterErrors, DepartamentoAPI, CategoriaAPI } from '../../../services/api';
import alerts from '../../../utils/alerts';
import { Autocomplete } from '@material-ui/lab';

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
	const { uuid } = useParams();
	const classes = useStyles();
  const [permissoes, setPermissoes] = useState([]);
  const [permissoesValue, setPermissoesValue] = useState([]);
  const [permissoesCollapseValue, setPermissoesCollapseValue] = useState({});
  const [nomeValue, setNomeValue] = useState('');
  const [descricaoValue, setDescricaoValue] = useState('');
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [departamentos, setDepartamentos] = useState([]);
  const [departamentosValue, setDepartamentosValue] = useState([]);
  const [categorias, setCategorias]  = useState([]);
  const [categoriasValue, setCategoriasValue]  = useState([]);
  const [todasCategorias, setTodasCategorias] = useState("todos");
  const [todosDepartamentos, setTodosDepartamentos] = useState("todos");

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

	useEffect(() => {
    if (!uuid) return

    PerfilServiceApi.get(uuid)
    .then(rs => {
        setNomeValue(rs.nome || '');
        setDescricaoValue(rs.descricao || '');
        setPermissoesValue(rs.permissoes ? rs.permissoes.map(p => p.uuid) : []);

        
        if (rs.departamentos.length === (departamentos.length - 1)) {
          setTodosDepartamentos("todos")
        } else {
          setDepartamentosValue(rs.departamentos ? rs.departamentos.map(d => d) : [])
          setTodosDepartamentos("escolher")
        }
        
        if (rs.categorias.length === (categorias.length - 1)) {
          setTodasCategorias("todos")
        } else {
          setCategoriasValue(rs.categorias ? rs.categorias.map(c => c) : [])
          setTodasCategorias("escolher")
        }

    })
    .catch(defaultProcessCatch());
    setIsUpdate(true);
	}, [uuid, categorias.length, departamentos.length]);

  useEffect(() => { 
    PermissaoAPI.list(1, 1000)
			.then(rs => setPermissoes(processPermissoes(rs.permissoes)))
			.catch(defaultProcessCatch()); 
  }, []);

  useEffect(() => {
    DepartamentoAPI.search("", true)
      .then(rs => setDepartamentos(rs.departamentos))
      .catch(defaultProcessCatch)
  }, [])

  useEffect(() => {
    const filtros = {}
    if (departamentosValue.length) {
      filtros["departamentos_uuid"] = departamentosValue.map(d => d.uuid)
    }
    CategoriaAPI.search({ filtros })
      .then(rs => setCategorias(rs.categorias))
      .catch(defaultProcessCatch)
  }, [departamentosValue])

  const submit = () => {
    if (loading) return

    setLoading(true);
    if (isUpdate) {
      PerfilServiceApi.update({
        uuid,
        nome: nomeValue,
        descricao: descricaoValue,
        permissoes_uuid: permissoesValue,
        departamentos_uuid: departamentosValue.map(d => d.uuid),
        categorias_uuid: categoriasValue.map(c => c.uuid)
      })
      .finally(() => setLoading(false))
      .then(_ => {
        alerts.snackbars.success('Perfil atualizado com sucesso');
      })
      .catch(defaultProcessCatch(errors => setErrors(errors)));
    } else {      
      PerfilServiceApi.create({
        nome: nomeValue,
        descricao: descricaoValue,
        permissoes_uuid: permissoesValue,
        departamentos_uuid: departamentosValue.map(d => d.uuid),
        categorias_uuid: categoriasValue.map(c => c.uuid)
      })
      .finally(() => setLoading(false))
      .then(_ => {
        setNomeValue('');
        setDescricaoValue('');
        setPermissoesValue([]);
        setErrors(null);
        setCategoriasValue([]);
        setDepartamentosValue([]);
        alerts.snackbars.success('Perfil criado com sucesso');
      })
      .catch(defaultProcessCatch(errors => setErrors(errors)));
    }
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

	return (
		<Page title={`Gestão de Usuários / Perfis / ${isUpdate ? 'Atualizar': 'Cadastro'}`} className={classes.root}>
			<Container maxWidth={false} style={{ marginTop: 20, overflow: "inherit" }}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Card style={{overflow: "inherit"}}>
							<CardHeader title={`${isUpdate ? 'Atualizar perfil' : 'Cadastro de um novo perfil'}`} />
							<Divider />
							<CardContent>
								<Grid container spacing={2}>
									<Grid item xs={12} md={6}>
										<TextField
                      autoFocus
											name="nome"
											label="Nome"
                      errorText={filterErrors(errors, 'nome')}
                      onChange={nome => setNomeValue(nome)}
											value={nomeValue} />
									</Grid>
									<Grid item xs={12} md={6}>
										<TextField
											name="descricao"
											label="Descrição"
                      errorText={filterErrors(errors, 'descricao')}
                      onChange={descricao => setDescricaoValue(descricao)}
											value={descricaoValue} />
									</Grid>
									<Grid item xs={12} md={6}>
                  <RadioGroup
                      row
                      value={todosDepartamentos}
                      onChange={(_, v)=>setTodosDepartamentos(v)}>
                      <RadioGroupOption value={"todos"}>
                        Todos os departamentos
                      </RadioGroupOption>
                      <RadioGroupOption value={"escolher"}>
                        Selecionar departamentos
                      </RadioGroupOption>
                    </RadioGroup>
                    <Collapse in={todosDepartamentos === "escolher"}>
                      <Autocomplete
                        multiple
                        limitTags={4}
                        options={departamentos}
                        value={departamentosValue}
                        onChange={(_, departamentos) => setDepartamentosValue(departamentos)}
                        getOptionLabel={option => option.nome}
                        getOptionSelected={(opt, value) => opt.uuid === value.uuid}
                        renderInput={(params) => (
                          <TextField {...params} variant="outlined" label="Departamentos" />
                        )}
                      />
                    </Collapse>
									</Grid>
									<Grid item xs={12} md={6}>
                  <RadioGroup
                      row
                      value={todasCategorias}
                      onChange={(_, v)=>setTodasCategorias(v)}>
                      <RadioGroupOption value={"todos"}>
                        Todas as categorias
                      </RadioGroupOption>
                      <RadioGroupOption value={"escolher"}>
                        Selecionar categorias
                      </RadioGroupOption>
                    </RadioGroup>
                  <Collapse in={todasCategorias === "escolher"}>
                    <Autocomplete
                        multiple
                        limitTags={4}
                        options={categorias}
                        value={categoriasValue}
                        onChange={(_, categorias) => setCategoriasValue(categorias)}
                        getOptionSelected={(opt, value) => opt.uuid === value.uuid}
                        getOptionLabel={option => option.nome}
                        renderInput={(params) => (
                          <TextField {...params} variant="outlined" label="Categorias" />
                        )}
                      />
                  </Collapse>
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
