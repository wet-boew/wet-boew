
<section><h2>@%tmpl-heading@ 2 (<code>h2</code>) - @%tmpl-default-app@</h2>
	<section><h3>@%tmpl-heading@ 3 (<code>h3</code>) - @%tmpl-default-app@</h3>
		<section><h4>@%tmpl-heading@ 4 (<code>h4</code>) - @%tmpl-default-app@</h4>
			<section><h5>@%tmpl-heading@ 5 (<code>h5</code>) - @%tmpl-default-app@</h5>
				<section><h6>@%tmpl-heading@ 6 (<code>h6</code>) - @%tmpl-default-app@</h6>
					<p>@%tmpl-para@ - @%tmpl-default-app@</p>
				</section>
			</section>
		</section>
	</section>
</section>

<p><a href="#">@%tmpl-link@ - @%tmpl-default-app@</a></p>
<p><a href="mailto:">@%tmpl-link@ (<code>mailto:</code>) - @%tmpl-default-app@</a></p>
<p><a href="http://www." rel="external">@%tmpl-link@ (@%third-party-link@) <code>http://www.</code> - @%tmpl-default-app@</a></p>
<p><a href=".doc">@%tmpl-link@ (@%tmpl-file-downloads@) <code>.doc</code>, <code>.psd</code>, <code>.zip</code>, <code>.pdf</code>, <code>.xls</code>, <code>.xlt</code>, <code>.rtf</code> @%tmpl-and@ <code>.txt</code> - @%tmpl-default-app@</a></p>
<p>@%tmpl-abbr@ - @%tmpl-default-app@: <abbr title="JavaScript">JS</abbr>.</p>

<ul>
<li>@%tmpl-ul@ (<code>ul</code>) @%tmpl-level@ 1 - @%tmpl-default-app@
	<ul>
	<li>@%tmpl-ul@ (<code>ul</code>) @%tmpl-level@ 2 - @%tmpl-default-app@
		<ul>
		<li>@%tmpl-ul@ (<code>ul</code>) @%tmpl-level@ 3 - @%tmpl-default-app@</li>
		</ul>
	</li>
	</ul>
</li>
</ul>

<ol>
<li>@%tmpl-ol@ (<code>ol</code>) @%tmpl-level@ 1 - @%tmpl-default-app@</li>
<li>@%tmpl-ol@ (<code>ol</code>) @%tmpl-level@ 1 - @%tmpl-default-app@
	<ol>
	<li>@%tmpl-ol@ (<code>ol</code>) @%tmpl-level@ 2 - @%tmpl-default-app@</li>
	<li>@%tmpl-ol@ (<code>ol</code>) @%tmpl-level@ 2 - @%tmpl-default-app@
		<ol>
		<li>@%tmpl-ol@ (<code>ol</code>) @%tmpl-level@ 3 - @%tmpl-default-app@</li>
		<li>@%tmpl-ol@ (<code>ol</code>) @%tmpl-level@ 3 - @%tmpl-default-app@</li>
		</ol>
	</li>
	</ol>
</li>
</ol>

<table>
<caption>@%tmpl-table-caption@ - @%tmpl-default-app@</caption>
<thead>
<tr>
<th scope="col">@%tmpl-table-head@ (<code>th</code>) - @%tmpl-default-app@</th>
<th scope="col">@%tmpl-table-head@ (<code>th</code>) - @%tmpl-default-app@</th>
</tr>
</thead>
<tbody>
<tr>
<td>@%tmpl-table-data@ (<code>td</code>) - @%tmpl-default-app@</td>
<td>@%tmpl-table-data@ (<code>td</code>) - @%tmpl-default-app@</td>
</tr>
</tbody>
</table>

<form action="#" method="post">
<div><label for="data1">@%tmpl-form@ <code>input</code> - @%tmpl-default-app@:</label> <input name="data1" type="text" id="data1" /></div>
<div><label for="data2">@%tmpl-form@ <code>textarea</code> - @%tmpl-default-app@:</label> <textarea name="data2" cols="15" rows="3" id="data2"></textarea></div>
<div><label for="data4">@%tmpl-form@ <code>select</code> - @%tmpl-default-app@:</label> 
<select id="data4" name="data4">
<option value="Option 1">@%tmpl-option@ 1</option>
<option value="Option 2">@%tmpl-option@ 2</option>
<option value="Option 3">@%tmpl-option@ 3</option>
<option value="Option 4">@%tmpl-option@ 4</option>
</select></div>
<fieldset><legend>@%tmpl-form@ <code>legend</code>, <code>fieldset</code> @%tmpl-and@ <code>checkbox</code> - @%tmpl-default-app@</legend>
<div><input name="checkbox" type="checkbox" id="data5" value="checkbox" />&#160;<label for="data5">@%tmpl-option@ 1</label>&#160;&#160;
<input name="checkbox" type="checkbox" id="data6" value="checkbox" />&#160;<label for="data6">@%tmpl-option@ 2</label>&#160;&#160;
<input name="checkbox" type="checkbox" id="data7" value="checkbox" />&#160;<label for="data7">@%tmpl-option@ 3</label>&#160;&#160;
<input name="checkbox" type="checkbox" id="data8" value="checkbox" />&#160;<label for="data8">@%tmpl-option@ 4</label></div>
</fieldset>
<div><input name="submit" type="submit" id="submit" value="@%tmpl-submit@ - @%tmpl-default-app@" />
<input name="reset" type="reset" id="reset" value="@%tmpl-reset@ - @%tmpl-default-app@" /></div>
</form>

<blockquote>
<p>&quot;<code>blockquote</code> - @%tmpl-default-app@&quot;.</p>
</blockquote>